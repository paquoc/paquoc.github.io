<!DOCTYPE html>
<html lang="en">
<head>
    <title>Get Comment</title>
    <meta charset="UTF-8">
    <link rel="icon" href="./favicon.png" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.2.1/dist/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
    <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/v/bs4/jszip-2.5.0/dt-1.11.5/b-2.2.2/b-html5-2.2.2/datatables.min.css"/>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/popper.js@1.12.9/dist/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossorigin="anonymous"></script>
    <script type="text/javascript" src="https://cdn.datatables.net/v/bs4/jszip-2.5.0/dt-1.11.5/b-2.2.2/b-html5-2.2.2/datatables.min.js"></script>
    <style>
        .link-cell {
            max-width: 150px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        body {
            width: 100%;
            height: 100vh;
        }
    </style>
</head>
<body>
    <div class="container mt-3">
        <h2>Get Post Comment TOOL</h2>
        <div class="mb-2" id="btn-logout" style="display: none">
            <button class="btn btn-primary" onclick="logout()">Log Out</button>
        </div>
        <script async defer crossorigin="anonymous" src="https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v13.0&appId=1258434921313330&autoLogAppEvents=1" nonce="w6xnQUdo"></script>
        <script src="./script.js?v=9"></script>

        <div class="fb-login-button"
             data-width=""
             data-size="large"
             data-button-type="login_with"
             data-layout="default"
             data-use-continue-as="true"
             data-onlogin="checkLoginState()"
             data-scope="pages_show_list, pages_read_engagement, pages_read_user_content"
        ></div>

        <div id="section-get-comment" style="display: none;">
            <div>
                <form id="form-select-page" class="mt-3">
                    <fieldset class="form-group">
                        <div class="row">
                            <legend class="col-form-label col-sm-2 pt-0">Chọn trang: </legend>
                            <div class="col-sm-8" id="radio-input-page">
                                <!-- <div class="form-check">
                                    <input class="form-check-input" type="radio" name="pageOptionRadios" id="option0" value="pageId"
                                        checked>
                                    <label class="form-check-label" for="pageOptionRadios">Page Name</label>
                                </div> -->
                            </div>
                        </div>
                    </fieldset>

                    <div class="form-group row">
                        <label for="post-link" class="col-sm-2 col-form-label">Link bài viết</label>
                        <div class="input-group col-sm-8">
                            <div class="input-group-prepend">
                                <div class="input-group-text">
                                    <i class="fa fa-link"></i>
                                </div>
                            </div>
                            <input id="post-link" name="post-link" type="text" class="form-control">
                        </div>
                    </div>
                    <div class="form-group row">
                        <label for="limit" class="col-sm-2 col-form-label">Giới hạn</label>
                        <div class="col-sm-6">
                            <input type="number" class="form-control" id="limit" value="4000">
                            <small class="form-text text-muted">
                                Mặc định không cần đổi số này, nếu tool không lấy được hết comment thì mới cần set giới hạn lớn hơn số comment trong bài viết 
                            </small>
                        </div>
                    </div>
                    <div class="form-group">
                        <button name="submit" type="button" class="btn btn-primary" onclick="getComment()">Submit</button>
                    </div>
                </form>
            </div>
            <div id="div-loading" style="display: none;">
                <div class="d-flex align-items-center text-primary flex-column">
                    <div class="spinner-border" role="status">
                        <span class="sr-only">Loading...</span>
                    </div>
                    <button name="stop" type="button" class="btn btn-danger mb-4 mt-2" onclick="abortCurrentXhr(true)">Dừng</button>
                </div>
            </div>
            <div id="div-table-comment" style="display: none">
                <table id="table-comment" class="table">
                    <thead>
                        <tr>
                            <th style="max-width: 15px">STT</th>
                            <th>Message</th>
                            <th>Image</th>
                            <th>Number</th>
                            <th>Hợp lệ</th>
                            <th>Link</th>
                        </tr>
                    </thead>
                    <tbody>

                    </tbody>
                </table>
            </div>
        </div>
    </div>
</body>
</html>