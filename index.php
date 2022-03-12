<!DOCTYPE html>
<html>
<head>
<title>Facebook Login JavaScript Example</title>
<meta charset="UTF-8">
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
</head>
<body>
<div id="fb-root"></div>
<script async defer crossorigin="anonymous" src="https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v13.0&appId=1258434921313330&autoLogAppEvents=1" nonce="fvu5SaBf"></script>
<script src="./script.js"></script>
<div class="fb-login-button" data-width="" data-size="large" data-button-type="login_with" data-layout="default" data-auto-logout-link="false" data-use-continue-as="false"></div>
<!-- The JS SDK Login Button -->

<div id="status">
</div>
<input type="text" placeholder="Post URL..." id="input-url"/>
<input type="button" value="Submit" onclick="getComment()"/>

</body>
</html>