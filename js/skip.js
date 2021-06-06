$(document).ready(function() {

    var old_task; //Tên task cũ
    var current_task;
    var time_interval = 2000; //Thời gian làm bài
    var daChuyenBai = false;
    var t = 0;
    var h = new Array();
    var turn = 1;

    //Ẩn nút hoàn thành
    var hiden_hoanthanh_btn = (task_updated) => {
        if (task_updated) {
            var style = document.createElement("div");
            document.body.appendChild(style).innerHTML = '<style>#mfooter .btn-info{display: none !important;}</style>';
            return true;
        }
        return false
    }
    var create_waiting_effect = (a) => {

        var html = "<button type=\"button\" class=\"btn btn-danger wait-btn\" style=\"display: inline-block;\"><i class=\"fa fa-spinner\"></i></button>";
        $('#mfooter').prepend(html);
        var time = 60;
        if (!a) var second = 30;
        else var second = a / 1000;
        var dot = '';

        return e = setInterval(function() {
            $('.wait-btn .fa-spinner').html('&nbsp;Hãy đợi ' + second + ' giây');
            if (second > 0)
                second -= 1;
            if (second == 0) clearInterval(e);
        }, 1000);
    }
    //Tự động làm bài
    var doAll = (status) => {
        function hasClass(element, className) {
            return (' ' + element.className + ' ').indexOf(' ' + className + ' ') > -1;
        }
        //Kiểm tra nếu xuất hiện captcha
        function checkIfhasClass(i) {
            var b = document.querySelectorAll(".dvoca");
            return hasClass(b[i], "active");
        }
        //Kiểm tra đã qua bài tiếp theo chưa
        $(document).on("statusOfChangeQues", function(event) {
            var task = (document.querySelectorAll(".dvoca.active"))[0];
            var task_far = task.querySelectorAll(".dans");
            var answer = task.querySelectorAll(".dans .dtitle .dtip");
            answer.forEach(function(target) {
                setTimeout(function() {
                    target.click();
                }, 1000)
            })
            setTimeout(function() {
                task_far.forEach(function(target) {
                    if (target.getAttribute("style") === null) {
                        var button = target.querySelectorAll(".dtitle .dtip");
                        button[0].click();
                    }
                })
            }, 1000)
            var t1;
            var i = setInterval(function() {
                $(document).on("TaskChanged", function(event) {
                    clearInterval(i);
                });

                if (!task.classList.contains("active")) {
                    $.event.trigger({
                        type: "statusOfChangeQues",
                        status: true
                    });
                    clearInterval(i);
                }
            }, 1000)
        });
        $(document).on("statusOfChangeQuesImg", function(event) {
            var task = (document.querySelectorAll(".dvoca.active"))[0];
            var task_far = task.querySelectorAll(".dans");
            var answer = task.querySelectorAll(".dans img");
            answer.forEach(function(target) {
                setTimeout(function() {
                    target.click();
                }, 1000)
            })
            setTimeout(function() {
                task_far.forEach(function(target) {
                    if (target.getAttribute("style") === null) {
                        var button = target.querySelectorAll(".dtitle img");
                        button[0].click();
                    }
                })
            }, 1000)
            var t1;
            var i = setInterval(function() {
                $(document).on("TaskChanged", function(event) {
                    clearInterval(i);
                });
                if (!task.classList.contains("active")) {
                    $.event.trigger({
                        type: "statusOfChangeQuesImg",
                        status: true
                    });
                    clearInterval(i);
                }
            }, 1000)
        });
        //Kiểm tra captcha có thay ảnh chưa
        $(document).on("statusOfChangeimg", function(event) {
            setTimeout(function() {
                var cap = document.getElementById("imgtxtcaptcha");
                if (typeof cap === 'undefined' || cap === null) {
                    $.event.trigger({
                        type: "statusOfBypass",
                        status: true
                    });
                } else {
                    $.event.trigger({
                        type: "statusOfBypass",
                        status: false
                    });
                }
            }, 3000);
        });
        //Kiểm tra xem đã qua mặt captcha chưa
        $(document).on("statusOfBypass", function(event) {
            if (event.status) {
                console.log("Bypass captcha thành công");
            } else {
                console.log("Bypass captcha thất bại");
                setTimeout(function() {
                    checkIfHasCaptcha();
                }, 3000);
            }
        });

        function changeCaptcha(oldimg) {
            var button_area = document.querySelectorAll(".dbxfote");
            var button = button_area[0].querySelectorAll('[dg-btn="btnSubmit"]');
            button[0].click();
            setTimeout(function() {
                if (document.getElementById("imgtxtcaptcha") === null || oldimg != document.getElementById("imgtxtcaptcha").src) {
                    $.event.trigger({
                        type: "statusOfChangeimg",
                        status: true
                    });
                    return true;
                } else return changeCaptcha(document.getElementById("imgtxtcaptcha").src);
            }, 3000);
        }

        function checkIfHasCaptcha() {
            var cap = document.getElementById("imgtxtcaptcha");
            if (typeof cap === 'undefined' || cap === null) {
                console.log("Không có captcha");
                return true;
            } else {
                var innervalue;
                var img;
                var indexOfL;
                img = document.getElementById("imgtxtcaptcha").src;
                indexOfL = img.substr(img.indexOf("&l=") + 3, 1);
                console.log("chiều dài captcha là: " + indexOfL);
                console.log("Đang giải mã captcha");
                Tesseract.recognize(
                    img,
                    'eng',
                ).then(({
                    data: {
                        text
                    }
                }) => {
                    if (text == '') {
                        changeCaptcha(img);
                        $.event.trigger({
                            type: "statusOfBypass",
                            status: false
                        });
                        return false;
                    }
                    console.log("Captcha đã giải mã: " + text);
                    text = text.trim();
                    innervalue = text.replaceAll(' ', '').replaceAll('—', '').replaceAll('€', 'e').replaceAll('&', '').replaceAll('™', '').replaceAll('/', '').replaceAll('\\', '').replaceAll(':', '').replaceAll('-', '').replaceAll('"', '').replaceAll('\'', '').replaceAll('-', '').replaceAll('_', '').replaceAll('.', '').replaceAll(',', '').replaceAll('°', '')
                    innervalue = innervalue.substr(0, indexOfL);
                    console.log("Captcha sau khi rút gọn: " + innervalue);
                    document.getElementById("txtcaptcha").value = innervalue;
                    changeCaptcha(img);
                })
            }
        }
        //Kiểm tra dạng bài
        function checkTypeOfTask() {

            //bài chọn đáp án trong 4 đáp án có giới hạn 30 giây
            if (document.getElementsByClassName("dchk").length != 0)
                return {
                    id: 1,
                    name: "chọn đáp án",
                    time: t,
                    limitTask: true
                };

            //bài từ vựng
            else if (document.querySelectorAll(".dvocabulary").length != 0)
                return {
                    id: 2,
                    name: "từ vựng",
                    time: time_interval,
                    limitTask: false
                };

            //bài nghe và chọn từ
            else if (document.querySelectorAll(".audio-choose-word").length != 0)
                return {
                    id: 3,
                    name: "nghe và chọn từ 1",
                    time: time_interval,
                    limitTask: false
                };

            //bài nghe và chọn từ
            else if (document.querySelectorAll(".word-choose-meaning").length != 0 || document.querySelectorAll(".image-choose-word").length != 0)
                return {
                    id: 4,
                    name: "nghe và chọn từ 2",
                    time: time_interval,
                    limitTask: false
                };

            // bài nghe và chọn từ mới
            else if (document.querySelectorAll(".audio-write-word").length != 0)
                return {
                    id: 5,
                    name: "sắp xếp chữ cái dạng 1",
                    time: time_interval,
                    limitTask: false
                };

            else if (document.querySelectorAll(".audio-choose-image").length != 0)
                return {
                    id: 6,
                    name: "nghe và chọn ảnh",
                    time: time_interval,
                    limitTask: false
                };

            else if (document.querySelectorAll(".pronunciation-write-word").length != 0)

                return {
                    id: 7,
                    name: "sắp xếp chữ cái dạng 2",
                    time: time_interval,
                    limitTask: false
                };
            else
                //bài điền đáp án có giới hạn 30 giây
                return {
                    id: 0,
                    name: "điền đáp án",
                    time: t,
                    limitTask: true
                };
        }
        //Làm các loại bài khác nhau
        function chonDapAn() {
            var input = document.getElementsByClassName("ques");
            var socauhoi = input.length;
            var id = new Array();
            for (var i = 0; i < input.length; i++) {
                id[i] = input[i].id;
                var checkbox = input[i].querySelectorAll(".dchk");
                checkbox[0].children[0].children[1].click();
            }
            var y = document.querySelectorAll('.dnut');
            console.log("Bấm nút xem đáp án");
            y[1].click(); // an nut xem dap an
            setTimeout(function() {
                var dapan = new Array();
                for (var i = 0; i < socauhoi; i++) {
                    dapan[i] = new Array();
                    dapan[i][0] = id[i];
                }
                for (var i = 0; i < dapan.length; i++) {
                    var checkbox = document.getElementById(dapan[i][0]).querySelectorAll(".iradio_square-green");
                    for (var j = 0; j < checkbox.length; j++) {
                        if (checkbox[j].classList.contains("checked")) dapan[i][1] = j;
                    }
                }
                console.log("Bấm nút làm lại");
                y[1].click(); //bam nut lam lai
                for (var i = 0; i < dapan.length; i++) {
                    var checkbox = document.getElementById(dapan[i][0]).querySelectorAll(".dchk");
                    checkbox[dapan[i][1]].children[0].children[1].click();
                }
            }, 2000);
            setTimeout(function() {
                console.log("Bấm nút hoàn thành");
                y[0].click(); //bamnut
                setTimeout(function() {
                    checkIfHasCaptcha();
                }, 1000);
            }, 4000);
            return true;
        }

        function tuVung() {
            chrome.storage.sync.get(["voc", "unit_vocal_taken"], function(items) {
                var task_id = window.location.pathname.split('/')[window.location.pathname.split('/').length - 1] + new URLSearchParams(window.location.search).get('id');
                var task_taken = items.unit_vocal_taken ? items.unit_vocal_taken : [];
                if (task_taken) {
                    for (var i = 0; i < task_taken.length; i++) {
                        if (task_taken[i] == task_id) break;
                    }
                    if (i == task_taken.length) {
                        task_taken[i] = task_id;
                        var arr = items.voc ? items.voc : new Array();
                        var ele = $('.dvocabulary .col-md-3 .hpanel .ditem h4');
                        var arr_index = arr.length;
                        for (var i = 0; i < ele.length; i++) {
                            arr[arr_index] = new Array();

                            arr[arr_index][0] = $(ele[i]).contents().filter(function() {
                                return this.nodeType == 3;
                            }).text().toUpperCase().replace('(N)', '').trim();

                            arr[arr_index][1] = calcMD5(arr[arr_index][0]).substring(0, 20);
                            arr_index++;
                        }
                        //lưu các từ vựng đã nghe

                        chrome.storage.sync.set({
                            "voc": arr,
                            "unit_vocal_taken": task_taken
                        }, function() {
                            console.log("Đã lưu " + arr.length + " từ vựng");
                        });
                    }
                }
                var y = document.querySelectorAll('.dnut');
                var x = document.querySelectorAll('.daudio');
                console.log("Click nghe các từ mới");
                x.forEach(function(target) {
                    target.click()
                });
                console.log("Bấm nút hoàn thành");
                y[0].click();
            });
        }

        function NgheVaChonTuVung() {
            $('.dtitle').attr('href', 'javascript:void(0);').attr('target', '_self');
            var task = (document.querySelectorAll(".dvoca.active"))[0];
            var alltask = (document.querySelectorAll(".dvoca"))[0];
            var task_far = task.querySelectorAll(".dans");
            var answer = task.querySelectorAll(".dans .dtitle .dtip");
            answer.forEach(function(target) {
                setTimeout(function() {
                    target.click();
                }, 1000)
            })
            setTimeout(function() {
                task_far.forEach(function(target) {
                    if (target.getAttribute("style") === null) {
                        var button = target.querySelectorAll(".dtitle .dtip");
                        button[0].click();
                    }
                })
            }, 1000)

            //mỗi một giây kiểm tra đã chuyển câu hỏi chưa
            var i = setInterval(function() {

                //nếu đã chuyển bài, dừng
                $(document).on("TaskChanged", function(event) {
                    clearInterval(i);
                });

                //nếu chưa chuyển bài thì thay đổi câu hỏi
                if (!task.classList.contains("active")) {
                    $.event.trigger({
                        type: "statusOfChangeQues",
                        status: true
                    });
                    clearInterval(i);
                }
            }, 1000)
        }

        function ngheVaChonAnh() {

            $('.dtitle').attr('href', 'javascript:void(0);').attr('target', '_self');
            var task = (document.querySelectorAll(".dvoca.active"))[0];

            var alltask = (document.querySelectorAll(".dvoca"))[0];
            var task_far = task.querySelectorAll(".dans");

            var answer = task.querySelectorAll(".dans img");
            answer.forEach(function(target) {
                target.click();
            })
            setTimeout(function() {
                task_far.forEach(function(target) {
                    if (target.getAttribute("style") === null) {
                        var button = target.querySelectorAll("img");
                        button[0].click();
                    }
                })
            }, 1000)

            //mỗi một giây kiểm tra đã chuyển câu hỏi chưa
            var i = setInterval(function() {

                //nếu đã chuyển bài, dừng
                $(document).on("TaskChanged", function(event) {
                    clearInterval(i);
                });

                //nếu chưa chuyển bài thì thay đổi câu hỏi
                if (!task.classList.contains("active")) {
                    $.event.trigger({
                        type: "statusOfChangeQuesImg",
                        status: true
                    });
                    clearInterval(i);
                }
            }, 1000)
        }
        //bài xếp chữ cái dựa trên các từ vựng đã lưu trong hệ thống, hãy mở các bài từ vựng để hệ thống tự động lưu các từ vựng
        function ngheAudioXepChuCai() {
            var voc2 = [
                ["OUTPUT DEVICES", "731a79c6ac0f0709e14f"]
            ];
            var voc;
            var old_ques_id;
            var current_ques_id;
            var a = $('.audio-write-word').first().find('.dvoca');
            var k = 0;
            var array;
            var array_leng;
            var input;
            var md5;
            var current_task_var2 = document.getElementById("dtasktitle").innerHTML;
            chrome.storage.sync.get(["voc"], function(items) {
                array = items.voc;
                array_leng = array.length;
                for (var l = 0; l < voc2.length; l++) {
                    array[array_leng] = voc2[l];
                    array_leng++;
                }
                input = new Array();
                $.event.trigger({
                    type: "DoiCauHoiTrongBaiSapXepTu",
                    status: true
                });
            });
            var abc = setInterval(function() {
                if (current_task_var2 != document.getElementById("dtasktitle").innerHTML)
                    clearInterval(abc);

                current_ques_id = $('.pronunciation-write-word').first().find('.dvoca.active').attr('id');
                if (current_ques_id != old_ques_id) {
                    old_ques_id = current_ques_id;
                    md5 = $('.pronunciation-write-word').first().find('.dvoca.active').find('.dtitle').attr('value');

                    if (k < a.length) {
                        for (var j = 0; j < array.length; j++) {
                            if (md5 == array[j][1]) { //kiem tra md5 co bang md5 cua tu vung khong
                                var tuvung = array[j][0];
                                for (var m = 0; m < tuvung.length; m++) {
                                    var chu_cai = tuvung[m];
                                    var dstore = $(a[k]).find('.dstore.sortable li div'); //lay ra cac chu cai chua dien vao

                                    for (var n = 0; n < dstore.length; n++) {
                                        if ($(dstore[n]).html() == chu_cai) { //neu nut bang tu 
                                            dstore[n].click();
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        k++;
                    }
                }
            }, 1000)
        }

        function nhinCachDocXepChuCai() {
            $.notify("Bài xếp chữ cái dựa vào số từ vựng đã lưu, nếu chưa tự động làm bài từ vựng, hãy mở bài từ vựng của unit hiện tại để hệ thống tự động lưu", {
                position: "b",
                autoHideDelay: 10000,
            });
            var voc2 = [
                ["OUTPUT DEVICES", "731a79c6ac0f0709e14f"]
            ];
            var voc;
            var old_ques_id;
            var current_ques_id;
            var a = $('.pronunciation-write-word').first().find('.dvoca');
            var k = 0;
            var array;
            var array_leng;
            var input;
            var md5;
            var current_task_var2 = document.getElementById("dtasktitle").innerHTML;
            chrome.storage.sync.get(["voc"], function(items) {
                array = items.voc;
                array_leng = array.length;
                for (var l = 0; l < voc2.length; l++) {
                    array[array_leng] = voc2[l];
                    array_leng++;
                }
                input = new Array();
                $.event.trigger({
                    type: "DoiCauHoiTrongBaiSapXepTu",
                    status: true
                });
            });
            var abc = setInterval(function() {
                if (current_task_var2 != document.getElementById("dtasktitle").innerHTML)
                    clearInterval(abc);

                current_ques_id = $('.pronunciation-write-word').first().find('.dvoca.active').attr('id');
                if (current_ques_id != old_ques_id) {
                    old_ques_id = current_ques_id;
                    md5 = $('.pronunciation-write-word').first().find('.dvoca.active').find('.dtitle').attr('value');

                    if (k < a.length) {
                        for (var j = 0; j < array.length; j++) {
                            if (md5 == array[j][1]) { //kiem tra md5 co bang md5 cua tu vung khong
                                var tuvung = array[j][0];
                                for (var m = 0; m < tuvung.length; m++) {
                                    var chu_cai = tuvung[m];
                                    var dstore = $(a[k]).find('.dstore.sortable li div'); //lay ra cac chu cai chua dien vao

                                    for (var n = 0; n < dstore.length; n++) {
                                        if ($(dstore[n]).html() == chu_cai) { //neu nut bang tu 
                                            dstore[n].click();
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        k++;
                    }
                }
            }, 1000)
        }

        function dienDapAn() {
            var y = document.querySelectorAll('.dnut');
            console.log("Bấm nút xem đáp án");
            y[1].click();

            setTimeout(function() {
                console.log("Bấm nút làm lại");
                y[1].click();
            }, 2000);
            setTimeout(function() {
                var new_input = document.getElementById("wrapper").querySelectorAll(".dinline");
                for (var j = 0; j < new_input.length; j++) {
                    new_input[j].value = new_input[j].placeholder;
                }
            }, 2000); //doi 1s sau do lam lai
            setTimeout(function() {
                console.log("Bấm nút hoàn thành");
                y[0].click();
                setTimeout(function() {
                    checkIfHasCaptcha();
                }, 1000);
            }, 2000);
            return true;
        }
        //
        function doSelectedTask(a) {
            switch (a) {
                case 0:
                    dienDapAn();
                    break;
                case 1:
                    chonDapAn();
                    break;
                case 2:
                    tuVung();
                    break;
                case 3:
                    NgheVaChonTuVung();
                    break;
                case 4:
                    NgheVaChonTuVung();
                    break;
                case 5:
                    xepChuCai();
                    break;
                case 6:
                    ngheVaChonAnh();
                    break;
                case 7:
                    nhinCachDocXepChuCai();
                    break;
            }
        }
        var DoTask = () => {
            setInterval(function() {
                current_task = document.getElementById("dtasktitle").innerHTML;
                //Nếu tên task thay đổi
                if (current_task)
                    if (current_task != old_task) {

                        old_task = current_task;

                        $.event.trigger({
                            type: "TaskChanged",
                            status: true
                        });

                        //Kiểm tra dạng task
                        var newTaskInformation = checkTypeOfTask();
                        var typeId = newTaskInformation.id;
                        var typeName = newTaskInformation.name;
                        var timeToDoTask = newTaskInformation.time;

                        iziToast.info({
                            timeout: 5000,
                            position: 'bottomLeft',
                            message: "Phát hiện bài " + typeName + " mới, tiếp tục làm tự động"
                        });
                        //Nếu bài phải làm trong 30 giây
                        if (newTaskInformation.limitTask) {

                            iziToast.warning({
                                timeout: t,
                                position: 'topRight',
                                close: true,
                                closeOnClick: true,
                                drag: false,
                                message: 'Đợi ' + t / 1000 + ' giây để hoàn thành Task',
                            });

                            //Tạo hiệu ứng chờ đợi
                            var effect = create_waiting_effect(timeToDoTask);

                            setTimeout(function() {
                                //xóa hiệu ứng chờ đợi
                                clearInterval(effect);
                                $('.wait-btn').hide();
                                doSelectedTask(typeId);
                            }, t);
                        }
                        //Nếu các bài không yêu cầu giới hạn thời gian
                        else {
                            iziToast.warning({
                                timeout: timeToDoTask,
                                position: 'topRight',
                                close: true,
                                closeOnClick: true,
                                drag: false,
                                message: 'Đợi ' + timeToDoTask / 1000 + ' giây để hoàn thành Task',
                            });
                            setTimeout(function() {
                                doSelectedTask(typeId);
                            }, timeToDoTask);
                        }
                    }
            }, 2000);
        }
        return status && DoTask();
    }
    //Kiểm tra trạng thái mới nhất
    chrome.storage.sync.get(["mode", "timeInterval"], function(items) {

        let check_task_updated = () => {

            return new Promise((res, rej) => {

                if (items.mode) {

                    time_interval = parseInt(items.timeInterval) ? parseInt(items.timeInterval) : 2000; //mặc định thời gian làm là 2 giây

                    t = (time_interval < 31000) ? 31000 : time_interval; //t là thời gian làm các bài yêu cầu giới hạn 30 giây

                    let getTime = () => {
                        let t_list = [
                            [2000, "2 giây"],
                            [60000, "1 phút"],
                            [300000, "5 phút"],
                            [1800000, "30 phút"],
                            [3600000, "1 giờ"],
                        ];
                        let str = '<select>';
                        $.each(t_list, function(i, n) {
                            str += '<option value="' + n + '" ';
                            if (time_interval == n[0])
                                str += 'selected';
                            str += '>' + n[1] + '</option>';
                        })
                        return str;
                    }

                    iziToast.success({
                        timeout: 0,
                        close: false,
                        closeOnClick: false,
                        drag: false,
                        message: 'Chế độ tự động làm bài đang bật',
                        buttons: [
                            ['<button>Tắt</button>', function(instance, toast) {
                                chrome.storage.sync.set({
                                    "mode": 0
                                }, function() {
                                    location.reload();
                                });
                            }, true],
                        ],
                    });
                    iziToast.info({
                        timeout: 0,
                        message: "Thời gian làm bài: ",
                        close: false,
                        closeOnClick: false,
                        drag: false,
                        message: "Thời gian làm bài: ",
                        inputs: [
                            [getTime(), 'change', function(instance, toast, select, e) {
                                let num = parseInt(select.options[select.selectedIndex].value);
                                chrome.storage.sync.set({
                                    "timeInterval": num
                                }, function() {
                                    console.log("Đã đổi thời gian làm bài");
                                    location.reload();
                                });
                            }]
                        ],
                    });

                    hiden_hoanthanh_btn();

                    doAll();

                    return res(true);
                }
                iziToast.warning({
                    timeout: 0,
                    message: "Thời gian làm bài: ",
                    close: false,
                    closeOnClick: false,
                    drag: false,
                    message: 'Chế độ tự động làm bài đang tắt',
                    buttons: [
                        ['<button>Bật</button>', function(instance, toast) {
                            chrome.storage.sync.set({
                                "mode": 1
                            }, function() {
                                location.reload();
                            });
                        }, true],
                    ],
                });

                return res(false);

            });
        }
        async function check_task() {

            let c =
                await check_task_updated()
                .then(is_updated => hiden_hoanthanh_btn(is_updated))
                .then(is_button_hide => doAll(is_button_hide));
        }

        check_task();

    });
})