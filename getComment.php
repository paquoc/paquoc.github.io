<!DOCTYPE html>
<html lang="en">
<head>
    <title>Get Comment</title>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
    <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/v/bs4/jszip-2.5.0/dt-1.11.5/b-2.2.2/b-html5-2.2.2/datatables.min.css"/>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/popper.js@1.12.9/dist/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossorigin="anonymous"></script>
    <script type="text/javascript" src="https://cdn.datatables.net/v/bs4/jszip-2.5.0/dt-1.11.5/b-2.2.2/b-html5-2.2.2/datatables.min.js"></script>
    <script src="./getComment.js?v=5"></script>
    <style>
        .waiting * {
            cursor: progress;
        }

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
    <div class="container">
        <h2>Get Post Comment</h2>
        <form>
            <div class="form-group">
                <label for="access-token">Access Token</label>
                <div class="input-group">
                    <div class="input-group-prepend">
                        <div class="input-group-text">
                            <i class="fa fa-key"></i>
                        </div>
                    </div>
                    <input id="access-token" name="access-token" placeholder="Page Access Token" type="text" class="form-control">
                </div>
                <span id="textHelpBlock" class="form-text text-muted">Get Access Token here: <a href="https://developers.facebook.com/tools/explorer" target="_blank">https://developers.facebook.com/tools/explorer</a></span>
            </div>
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

            <table id="table-comment" class="table">
            </table>
        </form>
    </div>
</body>
</html>