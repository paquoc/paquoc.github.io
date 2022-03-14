/**
 * @typedef {{
 *      authResponse: null | {accessToken, data_access_expiration_time, expiresIn, graphDomain, signedRequest, userID},
 *      status: "connected" | "unknown"
 * }} LoginStatusInfo
 *
 * @typedef {{
 *      access_token: string,
 *      category: string,
 *      category_list: {id, name}[],
 *      id: string,
 *      name: string,
 *      tasks: string[]
 * }} PageInfoObject
 *
 * @typedef {{
 *      data: PageInfoObject[],
 *      paging: {cursors: {after: string, before: string}, next: string}
 * }} AccountInfo
 */


/**
 * @typedef {{
 *      created_time: string,
 *      from: {name: string, id: string},
 *      message: string,
 *      id: string
 * }} CommentObject
 */

var SessionData = {
    accessToken: "",
    pageId: "",
    postId: "",
    /**
     * @type {CommentObject[]}
     */
    commentData: null,
}

/**
 * @type {PageInfoObject[]}
 */
var PageData = [];


// $(function (){
//     createFormSelectPage()
// })

function statusChangeCallback(response) {  // Called with the results from FB.getLoginStatus().
    console.log(response);                   // The current login status of the person.
    if (response.status === 'connected') {   // Logged into your webpage and Facebook.
        getPageList();
        $(".fb-login-button").hide();
        $("#btn-logout").show();
    }
}

function hideBtnLogin(){
    $(".fb-login-button").hide();
}

function checkLoginState() {               // Called when a person is finished with the Login Button.
    FB.getLoginStatus(function (response) {   // See the onlogin handler
        statusChangeCallback(response);
    });
}


window.fbAsyncInit = function () {
    FB.init({
        appId: '1258434921313330',
        cookie: true,                     // Enable cookies to allow the server to access the session.
        xfbml: true,                     // Parse social plugins on this webpage.
        version: 'v13.0'           // Use this Graph API version for this call.
    });


    FB.getLoginStatus(function (response) {   // Called after the JS SDK has been initialized.
        statusChangeCallback(response);        // Returns the login status.
    });
};

function getPageList() {                      // Testing Graph API after login.  See statusChangeCallback() for when this call is made.
    FB.api('/me/accounts', function (response) {
        if (response.data.length > 0){
            PageData = response.data;
            createFormSelectPage();
        } else {
            $("#section-get-comment").html(`<p>Bạn không quản lý Page nào.</p>`)
        }
    });
}

function createFormSelectPage() {
    let html = `<form id="form-select-page"><div class="form-group"><label>Chọn trang</label>`;
    PageData.forEach((pageInfo, index) => {
        let checked = index == 0 ? "checked" : "";
        let namePage = pageInfo.name;
        let id = pageInfo.id;
        html += `
                <div class="form-check">
                <input class="form-check-input" type="radio" name="pageOptionRadios" id="option${index}" value="${id}" ${checked}>
                    <label class="form-check-label" for="pageOptionRadios">
                        ${namePage}
                    </label>
                </div>
            `;
    })
    html += `</div>`;
    html += `
            <div class="form-group">
                <label for="post-link">Link bài viết</label>
                <div class="input-group">
                    <div class="input-group-prepend">
                        <div class="input-group-text">
                            <i class="fa fa-link"></i>
                        </div>
                    </div>
                    <input id="post-link" name="post-link" type="text" class="form-control">
                </div>
            </div>
            <div class="form-group">
                <button name="submit" type="button" class="btn btn-primary" onclick="getComment()">Submit</button>
            </div>
        </form>`
    html += `<table id="table-comment" class="table"></table>`
    $("#section-get-comment").html(html);
}

function getComment(){
    setWaitingEnabled(true);
    var pageId = $("#form-select-page input[type='radio']:checked").val();
    var pageInfo = PageData.find(page => page.id == pageId);
    if (!pageInfo)
        return;

    var accessToken = pageInfo.access_token;

    let link = $("#post-link").val();
    let postId = link.substr(link.lastIndexOf("/") + 1);
    if (!postId){
        onError(null, "Thiếu link bài viết");
        return;
    }

    SessionData = {
        accessToken: accessToken,
        pageId: pageId,
        postId: postId,
        commentData: []
    };
    goFetchComment();
}


function goFetchComment(afterNode = ""){
    var afterParam = "";
    if (afterNode){
        afterParam = `&after=${afterNode}`
    }

    let {pageId, postId, accessToken} = SessionData;
    $.ajax({
        method: "GET",
        url: `https://graph.facebook.com/v13.0/${pageId}_${postId}/comments?access_token=${accessToken}&limit=3000${afterParam}`,
        success: onFetchComment,
        error: (e)=>{onError(e, "Không lấy được comment");}
    })
}

/**
 * @param response
 */
function onFetchComment(response){
    //Check error?
    if (response.error){
        onError(response, response.error.message);
        return;
    }

    SessionData.commentData.push(...response.data);
    if (response.paging.next){
        let afterNode = response.paging.cursors.after;
        goFetchComment(afterNode);
    } else {
        onFetchFinish();
    }
}

function onFetchFinish(){
    //parse list comment
    setWaitingEnabled(false);
    let html = "";
    html += `<thead>
            <th style="max-width: 20px">STT</th>
            <th style="width: 110px">Time</th>
            <th>User</th>
            <th>Message</th>
            <th>Number</th>
            <th>Link</th>
        </thead>`;
    html += "<tbody>"
    SessionData.commentData.forEach((obj, index) => {
        var link = `https://www.facebook.com/${SessionData.pageId}/posts/${SessionData.postId}?comment_id=${obj.id.substr(obj.id.indexOf("_") + 1)}`
        html += `<tr>
                <td>${index}</td>
                <td>${formatTime(obj.created_time)}</td>
                <td>${obj.from? obj.from.name : ""}</td>
                <td>${obj.message}</td>
                <td>${getNumberInMessage(obj.message)}</td>
                <td class="link-cell"><a href="${link}" target="_blank">${link}k</a></td>
            </tr>`
    })
    html += "</tbody>"
    $("#table-comment").html(html);
    $('#table-comment').DataTable({
        retrieve: true,
        dom: 'lBfrtip',
        buttons: ['copy', 'excel']
    });
}

function getNumberInMessage(message){
    if (!message)
        return "";
    var arr = message.match(/\d/g);
    if (arr)
        return arr.join("");
    return "";
}

/**
 * @param {string} timeStr 2022-03-13T03:22:05+0000
 * @return {string} 2022-03-13 10:22:05
 */
function formatTime(timeStr){
    var s = new Date(new Date(timeStr).getTime() + 3600* 7000).toISOString()
    //s: 2022-03-13T10:22:05.000Z
    return s.substr(0, 10) + " " + s.substr(11, 8)
}


function onError(e, alertMessage = ""){
    setWaitingEnabled(false);
    if (alertMessage)
        alert(alertMessage);
    if (e)
        console.log(e);
}

function setWaitingEnabled(enabled){
    let body = $("body");
    let classname = "waiting";
    if (enabled){
        if (!body.hasClass(classname))
            body.addClass(classname);
    }
    else body.removeClass(classname);
    $("button[name=submit]").prop("disabled", enabled);
}

function logout(){
    FB.logout();
    $(".fb-login-button").show();
    $("#btn-logout").hide();
    $("#section-get-comment").html("");
}