$(document).ready(function () {
    chrome.storage.sync.get(["mode","timeInterval"], function (items) {
        //Tự cập nhật trạng thái gần nhất
        if (items.mode == 1) $('#task_toggle').attr('checked', true)
        if (items.timeInterval);
            $('option[value="'+items.timeInterval+'"]').attr('selected',true);
    });

    //Người dùng support cho devtu!
    $('#facebook_link').on('click',function(){
        var url = $(this).attr('url')
        chrome.tabs.executeScript({
            code: 'window.open("'+ url +'");'
        });
    })

    //Người dùng bật tắt chế độ làm bài
    $('#task_toggle').on('change', function () {
        if ($(this).is(":checked")) {
            chrome.storage.sync.set({
                "mode": 1
            }, function () {
                chrome.tabs.executeScript({
                    code: 'console.log("Đã bật chế độ tự làm online <3");location.reload();'
                });
            });
        } else {
            chrome.storage.sync.set({
                "mode": 0
            }, function () {
                chrome.tabs.executeScript({
                    code: 'console.log("Đã tắt chế độ tự làm online <3");location.reload();'
                });
            });
        }
    })

    //Người dùng bật tắt chế độ làm unit test
    $('#test_toggle').on('change', function () {
        if ($(this).is(":checked")) {
            chrome.storage.sync.set({
                "mode": 1
            }, function () {
                chrome.tabs.executeScript({
                    code: 'console.log("Đã bật chế độ tự làm unit test <3");location.reload();'
                });
            });
        } else {
            chrome.storage.sync.set({
                "mode": 0
            }, function () {
                chrome.tabs.executeScript({
                    code: 'console.log("Đã tắt chế độ tự làm unit test <3");location.reload();'
                });
            });
        }
    })

    //Người dùng thay đổi thời gian làm bài
    $('#timeInterval').on('change',function(){
        var num = parseInt($(this).val());
        chrome.storage.sync.set({
            "timeInterval": num
        }, function () {
            chrome.tabs.executeScript({
                code: 'console.log("Đã đổi thời gian làm bài");location.reload();'
            });
        });
    })
});