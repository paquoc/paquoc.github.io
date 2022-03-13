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

function getComment(){
    setWaitingEnabled(true);
    SessionData = {
        accessToken: "",
        pageId: "",
        postId: "",
        commentData: []
    };
    getPageId();
}

function onGetPageIdResponse(response){
    if (response.id){
        SessionData.pageId = response.id;
        fetchComment();
    } else {
        onError(response, "Không lấy được pageId, vui lòng kiểm tra Access Token");
    }
}

function setWaitingEnabled(enabled){
    let body = $("body");
    let classname = "waiting";
    if (enabled){
        if (!body.hasClass(classname))
            body.addClass(classname);
    }
    else body.removeClass(classname);
}

function onError(e, alertMessage = ""){
    setWaitingEnabled(false);
    if (alertMessage)
        alert(alertMessage);
    if (e)
        console.log(e);
}

function fetchComment(afterNode = ""){
    let link = $("#post-link").val();
    let postId = link.substr(link.lastIndexOf("/") + 1);
    if (!postId){
        onError(null, "Thiếu link bài viết");
        return;
    }
    SessionData.postId = postId;
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
        url: `https://graph.facebook.com/v13.0/${pageId}_${postId}/comments?access_token=${accessToken}${afterParam}`,
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
    if (response.next){
        let afterNode = response.paging.cursors.after;
        goFetchComment(afterNode);
    } else {
        onFetchFinish();
    }
}

function onFetchFinish(){
    //parse list comment
    let html = "";
    html += `<thead>
            <th>STT</th>
            <th>Time</th>
            <th>User</th>
            <th>Message</th>
            <th>Link</th>
        </thead>`;
    html += "<tbody>"
    SessionData.commentData.forEach((obj, index) => {
        html += `<tr>
                <td>${index}</td>
                <td>${obj.created_time}</td>
                <td>${obj.from? obj.from.name : "[empty]"}</td>
                <td>${obj.message}</td>
                <td><a href="https://facebook.com/${obj.id}" target="_blank">Comment Link</a></td>
            </tr>`
    })
    html += "</tbody>"
    $("#table-comment").html(html);
    $('#table-comment').DataTable({
        dom: 'lBfrtip',
        buttons: ['copy', 'excel']
    });
    setWaitingEnabled(false);
}

function getPageId(callback){
    let accessToken = $("#access-token").val();
    if (!accessToken){
        alert("Thiếu access token");
        return;
    }

    SessionData.accessToken = accessToken;
    $.ajax({
        method: "GET",
        url: `https://graph.facebook.com/v13.0/me?access_token=${accessToken}`,
        success: onGetPageIdResponse,
        error: onGetPageIdResponse
    })
}