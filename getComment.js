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
        url: `https://graph.facebook.com/v13.0/${pageId}_${postId}/comments?access_token=${accessToken}&limit=2000${afterParam}`,
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
                <td>${formatTime(obj.created_time)}</td>
                <td>${obj.from? obj.from.name : "[empty]"}</td>
                <td>${obj.message}</td>
                <td><a href="https://www.facebook.com/${SessionData.pageId}/posts/${SessionData.postId}?comment_id=${obj.id.substr(obj.id.indexOf("_") + 1)}" target="_blank">Comment Link</a></td>
            </tr>`
    })
    html += "</tbody>"
    $("#table-comment").html(html);
    $('#table-comment').DataTable({
        retrieve: true,
        dom: 'lBfrtip',
        buttons: ['copy', 'excel']
    });
    setWaitingEnabled(false);
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