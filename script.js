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
 *      paging: {cursors: {after: string, before: string}}
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
    } else {                                 // Not logged into your webpage or we are unable to tell.
        document.getElementById('status').innerHTML = 'Please log ' +
            'into this webpage.';
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
        console.log('Accounts: ', response);
        if (response.data.length > 0){

        }
        document.getElementById('status').innerHTML =
            'Thanks for logging in!';
    });
}

function getComment(){
    // var url = document.getElementById("input-url").value;
    // if (!url)
    //     return;
    // var pageId = Object.keys(PageAccessToken)[0];
    // var accessToken = PageAccessToken[pageId];
    // var postId = url.substr(s.lastIndexOf("/") + 1);
    // FB.api(
    //     '/1798713497075922_2301386663475267/comments',
    //     'GET',
    //     {},
    //     function(response) {
    //         console.log(response);
    //     }
    //   );
    FB.api('/me', function (response) {
        console.log('Me: ', response);
    });
}