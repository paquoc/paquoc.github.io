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
 *      media: {
 *          image: {
 *              height: number,
 *              width: number, 
 *              src: string
 *          }
 *      }, 
 *      target: {
 *          id: string, 
 *          url: string
 *      }, 
 *      type: string, 
 *      url: string
 * }} AttachmentObj
 * //Docs: https://developers.facebook.com/docs/graph-api/reference/story-attachment/
 */

/**
 * @typedef {{
 *      created_time: string,
 *      message: string,
 *      id: string,
 *      attachment: AttachmentObj
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
    currentXhr: null,
    markExistUserId: null,
}

/**
 * @type {PageInfoObject[]}
 */
var PageData = [];

$(document).ready(function (){
    initDataTable();
    // createFormSelectPage()
})

function statusChangeCallback(response) {  // Called with the results from FB.getLoginStatus().
    console.log(response);                   // The current login status of the person.
    if (response.status === 'connected') {   // Logged into your webpage and Facebook.
        getPageList();
        $(".fb-login-button").hide();
        $("#btn-logout").show();
    }
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
    let html = "";
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
    $("#radio-input-page").html(html);
    $("#section-get-comment").show();
}

function getComment(){
    $("#div-table-comment").hide();
    setWaitingEnabled(true);
    var pageId = $("#form-select-page input[type='radio']:checked").val();
    var pageInfo = PageData.find(page => page.id == pageId);
    if (!pageInfo)
        return;

    var accessToken = pageInfo.access_token;

    let link = $("#post-link").val();
    var postId = getPostId(link);

    if (!postId){
        onError(null, "Thiếu link bài viết");
        return;
    }

    SessionData = {
        accessToken: accessToken,
        pageId: pageId,
        postId: postId,
        commentData: [],
        markExistUserId: {}
    };
    goFetchComment();
}

function getPostId(link){
    let postId, pos;
    if ((pos = link.indexOf("posts/")) >= 0){
        //Case https://www.facebook.com/thuvientinhnang/posts/POST_ID
        postId = getFirstNumPhrase(link.substr(pos));
    } else if ((pos = link.indexOf("fbid=")) >= 0){
        //Case https://www.facebook.com/permalink.php?story_fbid=POST_ID&id=PAGE_ID
        postId = getFirstNumPhrase(link.substr(pos));
    } else postId = getFirstNumPhrase(link);

    return postId
}

function getFirstNumPhrase(str){
    var arrNum = str.match(/\d+/g);
    if (arrNum && arrNum.length > 0)
        return arrNum[0];
    return null;
}


function goFetchComment(afterNode = ""){
    var afterParam = "";
    if (afterNode){
        afterParam = `&after=${afterNode}`
    }

    let {pageId, postId, accessToken} = SessionData;
    abortCurrentXhr();
    let limit = $("#limit").val();
    SessionData.currentXhr = $.ajax({
        method: "GET",
        url: `https://graph.facebook.com/v13.0/${pageId}_${postId}/comments?&access_token=${accessToken}&limit=${limit}&fields=attachment,created_time,message,id${afterParam}`,
        success: onFetchComment,
        error: (e)=>{onError(e, "Không lấy được comment");}
    })
}

function abortCurrentXhr(turnOffWaitingStatus = false){
    if (SessionData.currentXhr){
        SessionData.currentXhr.abort();
        SessionData.currentXhr = null;
    }

    if (turnOffWaitingStatus)
        setWaitingEnabled(false);
}

/**
 * @param response
 */
function onFetchComment(response){
    SessionData.currentXhr = null;
    //Check error?
    if (response.error){
        onError(response, response.error.message);
        return;
    }

    SessionData.commentData.push(...response.data);
    appendTableComment(response.data);
    if (response.paging && response.paging.next && response.paging.cursors){
        let afterNode = response.paging.cursors.after;
        goFetchComment(afterNode);
    } else {
        onFetchFinish();
    }
}

function onFetchFinish(){
    setWaitingEnabled(false);
}

function appendTableComment(comments){
    var table = $('#table-comment').DataTable();
    table.clear();
    table.rows.add(comments);
    table.draw();
    $("#div-table-comment").show();
}

function getNumberInMessage(message){
    if (!message)
        return "";
    var arr = message.match(/\d/g);
    if (arr)
        return arr.join("");
    return "";
}

function checkIsValidCommnet(message){
    var number = getNumberInMessage(message);
    if (number == "")
        return "Không có số"
    if (SessionData.markExistUserId[number]){
        return "Trùng"
    }    
    SessionData.markExistUserId[number] = true;
    return "";
}

function onError(e, alertMessage = ""){
    SessionData.currentXhr = null;
    setWaitingEnabled(false);
    if (alertMessage)
        alert(alertMessage);
    if (e)
        console.log(e);
}

function setWaitingEnabled(enabled){
    let spinner = $("#div-loading");
    if (enabled)
        spinner.show();
    else spinner.hide();
    $("button[name=submit]").prop("disabled", enabled);
}

function logout(){
    FB.logout();
    $(".fb-login-button").show();
    $("#btn-logout").hide();
    $("#section-get-comment").hide();
}

function initDataTable() {
    var i = 0;
    $('#table-comment').DataTable({
        dom: 'lBfrtip',
        buttons: ['excel'],
        columnDefs: [
            {
                targets: i++,
                data: null,
                render: ( data, type, row, meta ) => meta.row
            },
            {
                targets: i++,
                data: "message",
                render: data => data
            },
            {
                targets: i++,
                data: "attachment",
                render:  (/** @type {AttachmentObj} */ data) => {
                    if (!data) return "";
                    if (data && data.media && data.media.image && data.media.image.src)
                        return `<span style="display:none">x</span><img src="${data.media.image.src}" width="100" height="auto"/>`
                }
            },
            {
                targets: i++,
                data: "message",
                render: data => getNumberInMessage(data)
            },
            {
                targets: i++,
                data: "message",
                render: data => checkIsValidCommnet(data)
            },
            {
                targets: i++,
                data: "id",
                className: "link-cell",
                render: data => {
                    var link = `https://www.facebook.com/${SessionData.pageId}/posts/${SessionData.postId}?comment_id=${data.substr(data.indexOf("_") + 1)}`
                    return `<a href="${link}" target="_blank">${link}</a>`;
                }
            }
        ]
    });

}