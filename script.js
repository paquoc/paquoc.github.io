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
 * @type {PageInfoObject[]}
 */
var PageData = [];


// $(function (){
//     window.location.href = "./getComment.php"
// })

function statusChangeCallback(response) {  // Called with the results from FB.getLoginStatus().
    console.log(response);                   // The current login status of the person.
    if (response.status === 'connected') {   // Logged into your webpage and Facebook.
        testAPI();
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

function testAPI() {                      // Testing Graph API after login.  See statusChangeCallback() for when this call is made.
    console.log('Welcome!  Fetching your information.... ');
    FB.api('/me/accounts', function (response) {
        if (response.data.length > 0){
            PageData = response.data;
            createFormSelectPage();
        }
    });
}

function createFormSelectPage(){
    let divSectionGetComment = $("#section-get-comment");
    if (PageData.length == 0){
        divSectionGetComment.html(`<p>Bạn không quản lý Page nào.</p>`)
    } else {
        let html = `<form id="form-select-page"><div class="form-group"><label>Chọn trang</label>`;
        PageData.forEach((pageInfo, index) => {
            let checked = index == 0? "checked" : "";
            let namePage = pageInfo.name;
            let id = pageInfo.id;
            html += `
                <div class="form-check">
                <input class="form-check-input" type="radio" name="pageOptionRadios" id="option${index}" value="${id}" ${checked}>
                    <label class="form-check-label" for="pageOptionRadios">
                        ${namePage}
                    </label>
            `;
        })
        html += `</div></form>`;
        divSectionGetComment.html(html);
    }
}