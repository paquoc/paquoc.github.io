/**
 * @typedef {{
 *      authResponse: null | {accessToken, data_access_expiration_time, expiresIn, graphDomain, signedRequest, userID},
 *      status: "connected" | "unknown"
 * }} LoginStatusInfo
 *
 * @typedef {{
 *      access_token: string,
 *      id: string,
 *      name: string,
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
    currentXhr: null,
}

var Options = {
    limit: 1,
    filterValue: "",
    findWholeWord: false,
    ignoreCommentReply: true,
}

var Config = {
    userIDLen: {from: 6, to: 9},
    groups: {}
}

/** @type {{error, warning, success}} */
var toastr = toastr || {};
/**
 * @type {PageInfoObject[]}
 */
var PageData = [];

$(function (){
    initDataTable();
    initTextArea();
    initAccessTokenInput();
    initToastr();
})

function statusChangeCallback(response) {  // Called with the results from FB.getLoginStatus().
    console.log(response);                   // The current login status of the person.
    let hintText =  $(".hint-text-without-login");
    if (response.status === 'connected') {   // Logged into your webpage and Facebook.
        getPageList();
        $(".fb-login-button").hide();
        $("#btn-logout").show();
        hintText.hide();
    } else {
        hintText.show();
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
        if (response.data && response.data.length > 0){
            PageData = response.data;
            createFormSelectPage();
        } else {
            $("#section-get-comment").html(`<p>Bạn không quản lý Page nào.</p>`).show();
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

function submitForm(){
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
        commentData: []
    };
    $('#table-comment').DataTable().clear();
    Options = {
        limit: $("#limit").val(),
        filterValue: $("#check-value").val(),
        findWholeWord: $("#whole-word-check").prop("checked"),
        ignoreCommentReply: $("#ignore-reply-comment-check").prop("checked"),
    }
    goFetchComment();
}

function getPostId(link){
    let postId, pos;
    if ((pos = link.indexOf("posts/pfbid")) >= 0){
        //Case https://www.facebook.com/Icazingplay/posts/pfbid0nWb5...
        postId = link.substr(pos + "posts/".length);
    } else if ((pos = link.indexOf("posts/")) >= 0){
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
    let limit = Options.limit;
    let filter = Options.ignoreCommentReply? "toplevel" : "stream";
    SessionData.currentXhr = $.ajax({
        method: "GET",
        url: `https://graph.facebook.com/v13.0/${pageId}_${postId}/comments?access_token=${accessToken}&limit=${limit}&filter=${filter}&fields=message,id${afterParam}`,
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
    table.rows.add(comments);
    table.draw();
    $("#div-table-comment").show();
}

function getUserIdInMessage(message){
    if (!message)
        return "";
    if (!Config || !Config.userIDLen){
        console.error("Thiếu config độ dài UserID");
        return;
    }

    var arr = message.match(/[]{0,1}[\d]{0,1}[\d]+/g);
    if (arr){
        for(var i = 0; i < arr.length; i++){
            var num = arr[i];
            if (num.length >= Config.userIDLen.from && num.length <= Config.userIDLen.to){
                return num;
            }
        }
    }
    return "";
}

function checkFilterValue(message){
    var filterValue = Options.filterValue;
    if (!filterValue)
        return "-";
    
    message = message.toLowerCase();
    filterValue = filterValue.toLowerCase();
        
    var isWholeWord = Options.findWholeWord;
    var arr = message;
    if (isWholeWord)
        arr = message.split(/\s+/);

    filterValue = filterValue.split(",");
    for (var i = 0; i < filterValue.length; i++){
        if (arr.indexOf(filterValue[i]) >= 0)
            return "x"; 
    }
    
    return "";
}

function onError(e, alertMessage = ""){
    SessionData.currentXhr = null;
    setWaitingEnabled(false);
    if (e.statusText == "abort")
        return;

    if (alertMessage)
        toastr.error(alertMessage);
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
    var id = 0;
    $('#table-comment').DataTable({
        dom: 'lBfrtip',
        buttons: ['copy', 'excel'],
        columnDefs: [
            {
                targets: id++,
                data: null,
                render: ( data, type, row, meta ) => meta.row
            },
            {
                targets: id++,
                data: "message",
                render: data => data
            },
            {
                targets: id++,
                data: "message",
                render: data => getUserIdInMessage(data)
            },
            {
                targets: id++,
                data: "message",
                render: data => divideToGroup(data)
            },
            {
                targets: id++,
                data: "message",
                render: data => checkFilterValue(data)
            },
            {
                targets: id++,
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

function showWithoutLoginSection(){
    $(".fb-login-button").hide();
    $(".hint-text-without-login").hide();
    $("#form-access-token").show();
    return false;
}

function initTextArea(){
    document.getElementById('advanced-settings-input')
        .addEventListener('keydown', function(e) {
        if (e.key == 'Tab') {
            e.preventDefault();
            var start = this.selectionStart;
            var end = this.selectionEnd;

            // set textarea value to: text before caret + tab + text after caret
            this.value = this.value.substring(0, start) +
                "\t" + this.value.substring(end);

            // put caret at right position again
            this.selectionStart =
                this.selectionEnd = start + 1;
        }
    });
    $("#advanced-settings-input").val(JSON.stringify(Config, null, 4));
}

function divideToGroup(message){
    if (!Config || !Config.groups)
        return "";
    if (typeof Config.groups !== "object")
        return "";

    for(let group in Config.groups){
        let searchTexts = Config.groups[group];
        if (typeof searchTexts == "string")
            searchTexts = [searchTexts];
        for(let i = 0; i < searchTexts.length; i++){
            if (checkPatternInComment(message, searchTexts[i]))
                return group;
        }
    }
    return "";
}

function checkPatternInComment(msg, pattern){
    msg = removeAccents(msg).toLowerCase();
    pattern = removeAccents(pattern).toLowerCase();
    return msg.indexOf(pattern) >= 0;
}

function removeAccents(str) {
    return str.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd').replace(/Đ/g, 'D');
}


function formatTextArea(textarea){
    textarea = $(textarea);
    var text = textarea.val();
    var obj = null;
    try {
        obj = JSON.parse(text);
    } catch (e){}

    if (obj) {
        var newStr = JSON.stringify(obj, null, 4);
        textarea.val(newStr)
    } else {
        alert("Có lỗi trong chuỗi JSON config, vui lòng kiểm tra lại");
    }
}

function submitAccessToken(){
    let accessToken = $("#access-token-input").val();
    goFetchPageId(accessToken);
}

function goFetchPageId(accessToken){
    $.ajax({
        method: "GET",
        url: `https://graph.facebook.com/v13.0/me?access_token=${accessToken}`,
        success: function(response){ onFetchPageId(response, accessToken)},
        error: (e)=>{onError(e, "Không lấy được pageId");}
    })
}

function onFetchPageId(response, accessToken){
    if (response.error){
        onError(response, "Không thể lấy pageId, vui lòng kiểm tra lại Access Token");
        return;
    }

    PageData = [{
        access_token: accessToken,
        id: response.id,
        name: response.name
    }];
    $("#form-access-token").hide();
    createFormSelectPage();
}

function initAccessTokenInput(){
    $("#access-token-input").on("keypress", function (e){
        if (e.key == "Enter"){
            $("#submit-access-token").click();
        }
    });
}

function initToastr(){
    toastr.options = {
        closeButton: true,
        newestOnTop: true,
        progressBar: true,
        positionClass: "toast-top-center",
        preventDuplicates: false,
        showDuration: 200,
        hideDuration: 200,
        timeOut: 2500,
        extendedTimeOut: 2000,
    };
}