// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232509
(function () {
	"use strict";

	var app = WinJS.Application;
	var activation = Windows.ApplicationModel.Activation;

	app.onactivated = function (args) {
		if (args.detail.kind === activation.ActivationKind.launch) {
			if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
			    // TODO: This application has been newly launched. Initialize your application here.
			    init();
			} else {
				// TODO: This application has been reactivated from suspension.
				// Restore application state here.
			}
			args.setPromise(WinJS.UI.processAll());
		}
	};

	app.oncheckpoint = function (args) {
		// TODO: This application is about to be suspended. Save any state that needs to persist across suspensions here.
		// You might use the WinJS.Application.sessionState object, which is automatically saved and restored across suspension.
		// If you need to complete an asynchronous operation before your application is suspended, call args.setPromise().
	};

	app.start();


	function init() {
	    console.log("init");
	    $(".bottom-container .play").on('click', function (evt) {
	        evt.preventDefault();
	        var icon = $(this).find("i");
	        var maudio = $("audio");
	        if (icon.hasClass("fa-play")) {
	            // play start
	            if (typeof maudio.attr("src") != 'undefined') {
	                // change icon
	                $(".bottom-container .play i").removeClass("fa-play").addClass("fa-pause");
	                maudio[0].play();
	            } else {
	                playMusicList();
	            }
	        } else {
	            // pause clicked
	            maudio[0].pause();
	            // change icon
	            $(".bottom-container .play i").removeClass("fa-pause").addClass("fa-play");
	        }
	    })

	    $(".audio-player .download").on("click", function (evt) {
	        evt.preventDefault();
	        var url = maudio.attr("src");
	        // TODO:
	        // save file to local storage, enable offline play next time

	    })

	    $("audio").on('timeupdate', function (evt) {
	        var percentage = this.currentTime / this.duration * 100;
	        $(".player-progress .inner").css({
	            'width': percentage.toFixed(1) + "%",
	        });
	    })
	}

	function playMusicList() {
	    // get play list

	    WinJS.xhr({
	        type: 'GET',
	        url: 'http://randoms.me:9990/playList/slow',
	    }).done(function completed (res, ss) {
	        randomPlay(JSON.parse(res.responseText));
	    }, function error (res) {
	        $(".bottom-container .title").text("连接服务器失败");
	    }, function (evt) {

	    });

	    function randomPlay(musicList) {
	        if (musicList.length == 0) {
	            return;
	        }
	        var next = function (mMusicList, playedList) {
	            if (mMusicList.length == playedList.length) {
	                playedList = [];
	            }
	            // gene random order
	            var unplayedList = []
                if(typeof mMusicList.forEach == "undefined")
	                mMusicList = new WinJS.Binding.List(mMusicList);
	            mMusicList.forEach(function (name) {
	                var length = playedList.length
	                var playFlag = false
	                for (var i = 0; i < length; i++) {
	                    if (name == playedList[i]) {
	                        playFlag = true
	                    }
	                }
	                if (!playFlag) unplayedList.push(name)
	            })
	            var order = parseInt(Math.random() * unplayedList.length)
	            console.log('unplayed', unplayedList);
	            play(unplayedList[order], function () {
	                playedList.push(unplayedList[order])
	                next(mMusicList, playedList)
	            })
	        }
	        next(musicList, [])
	    }

	    function play(url, callback) {
	        // play the target music and call callback if music ends
	        var extention = url.split(".");
	        extention = extention[extention.length - 1]
	        if (extention != "mp3") {
	            // can only play mp3 files
	            callback();
	            return;
	        }
	        var name = url.split('/');
	        name = name[name.length - 1];
	        // set name
	        $(".bottom-container .title").text(name);
	        var maudio = $("audio");
	        maudio.attr("src", url);
	        maudio[0].play();
	        // change icon
	        $(".bottom-container .play i").removeClass("fa-play").addClass("fa-pause");
	        // remove binding events
	        // next button clicked
	        $(".bottom-container .next").off("click");
	        $(".bottom-container .next").on("click", function (evt) {
	            evt.preventDefault();
	            callback();
	        })
	        // play end events
	        var maudio = $("audio");
	        maudio.off('ended');
	        maudio.on('ended', callback);
	    }
	}
})();
