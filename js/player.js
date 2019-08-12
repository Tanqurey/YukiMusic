$(function () {
    var musicPlayer = $('.music-player')
    var player = $('.music-player').get(0)
    var storage = window.localStorage
    var length = storage.length
    if (length == 0) {
        alert('您的曲库还没有音乐，请搜索添加!(本站音乐来源网易云音乐)')
    } else {
        for (let i = 0; i < length; i++) {
            let firstRec = storage.key(i)
            if (firstRec.includes('9%$@a')) {
                var firstSong = getLocalSong(firstRec)
                loadSong(firstSong)
                break
            }
        }
    }
    if (!firstSong) {
        alert('您的曲库还没有音乐，请搜索添加!(本站音乐来源网易云音乐,付费歌曲无法播放)')
    }

    Openpaint()
    //遍历并渲染本地数据
    function Openpaint() {
        let length = storage.length
        for (let i = 0; i < length; i++) {
            let thisRec = storage.key(i)
            if (thisRec.includes('9%$@a')) {
                let paintItem = storage.getItem(thisRec)
                paintPlayList(JSON.parse(paintItem))
            }
        }
        beginPlay($('.playlist-play'))
        removeItem($('.playlist-remove'))
    }

    //删除列表及localstorage函数
    function removeItem(clickObjs) {
        clickObjs.on('click', function () {
            let name = this.dataset.listname
            storage.removeItem(name)
            $(this.parentElement).remove()
        })
    }



    //搜索歌曲逻辑
    $('#songQuery').click(function () {
        songquery($('#songName').val())
        $('#songName').val('')
    })

    function songquery(songName) {
        $.ajax({
            type: 'get',
            dataType: 'json',
            success: success,
            url: 'https://api.mlwei.com/music/api/wy/',
            data: {
                key: '523077333',
                type: 'so',
                id: songName
            },
            error: function (err) {
                console.log(err)
                alert('获取歌曲资源出错，请稍后重试')
            }
        })
    }
    //成功回调
    function success(res) {
        console.log(res)
        $('.search-body').eq(0).empty()
        let data = res.Body
        for (let i in data) {
            let eachSong = data[i]
            storage.setItem("res" + i, JSON.stringify(data[i]))
            //渲染
            let temp = "<li class='list-item'><div class='search-name'>{{title}}</div><div class='search-singer'>{{author}}</div></li>"
            let render = template.compile(temp)
            let html = render(eachSong)
            $('.search-body').eq(0).append(html)
        }
        let songLi = $('.list-item')
        for (let i in songLi) {
            let songitem = songLi.eq(i)
            let icon = $(`<div class="search-play fa fa-play" data-no=${i}></div><div class="search-add fa fa-plus" data-no=${i}></div>`)
            songitem.append(icon)
        }
        //注册点击事件
        beginPlay($('.search-play'))
        addToList($('.search-add'))
    }

    //按钮切换 播放和暂停
    function iconSwitch() {
        let icon = $('.play-btn').eq(0)
        icon.toggleClass('fa-pause')
        icon.toggleClass('fa-play')
    }


    $('.play-btn').click(function () {
        let player = musicPlayer.get(0)
        if (player.paused) {
            player.play()
        } else {
            player.pause()
        }
        iconSwitch()
    })

    //时间规范
    function getResult(total) {
        var min = Math.floor(total % 3600 / 60)
        min = min.toString()
        min = min.padStart(2, '0')
        var sec = Math.floor(total % 60)
        sec = sec.toString()
        sec = sec.padStart(2, "0")
        return min + ':' + sec
    }


    //进度条逻辑 进度时间更新
    musicPlayer.get(0).ontimeupdate = function () {
        var current = musicPlayer.get(0).currentTime
        let fomatCurr = getResult(current)
        $('.currentTime').eq(0).html(fomatCurr)
        $(".currentBar").css("width", (current / musicPlayer.get(0).duration) * 100 + "%")
    }
    musicPlayer.get(0).onprogress = function () {
        let loaded = musicPlayer.get(0).buffered.end(0)
        $(".buffer").css("width", (loaded / musicPlayer.get(0).duration) * 100 + "%")
    }



    //播放完毕后字体图标切换
    musicPlayer.get(0).onended = function () {
        iconSwitch()
    }

    //进度条跳转
    $('.bar').eq(0).click(function (e) {
        var offset = e.offsetX;
        var percent = offset / $(this).width()
        let current = percent * musicPlayer.get(0).duration
        musicPlayer.get(0).currentTime = current
    })
    //加载音乐
    function loadSong(song) {
        player.src = song.url
        $('.title').html('正在播放：' + song.title)
        $('.singer').html('歌手：' + song.author)
        $('.cover-pic').get(0).src = song.pic
        player.oncanplay = function () {
            player.play()
            if ($('.repeat').eq(0).attr("class").includes("fa-repeat")) {
                orderMode()
            }
            $('.duration').html(getResult(this.duration))
        }
        if ($('.play-btn').eq(0).attr("class").includes("fa-play")) {
            iconSwitch()
        }

    }

    //播放音乐函数
    function beginPlay(clickObjs) {
        clickObjs.on("click", function () {
            if (this.dataset.no) {
                var id = this.dataset.no
                var song = getSearchSong(id)
            }
            if (this.dataset.listname) {
                var id = this.dataset.listname
                var song = getLocalSong(id)
            }
            loadSong(song)
            let name = `${song.author}9%$@a${song.title}`
            if (storage.getItem(name)) return
            let resId = this.dataset.no
            let songInfo = JSON.parse(storage.getItem(`res${resId}`))
            saveSong(songInfo)
            let newItem = paintPlayList(song)
            beginPlay(newItem.lastPlay)
            removeItem(newItem.lastRemove)
        })
    }

    //添加到播放列表
    function addToList(clickObjs) {
        for (let i = 0; i < clickObjs.length; i++) {
            let thisSong = clickObjs.get(i)
            let id = thisSong.dataset.no
            let song = JSON.parse(storage.getItem(`res${id}`))
            let name = `${song.author}9%$@a${song.title}`
            if (storage.getItem(name)) return
            thisSong.onclick = function () {
                if (storage.getItem(name)) return
                saveSong(song)
                let newItem = paintPlayList(song)
                beginPlay(newItem.lastPlay)
                removeItem(newItem.lastRemove)
            }

        }

    }
    //保存歌曲信息

    function saveSong(obj) {
        storage.setItem(`${obj.author}9%$@a${obj.title}`, JSON.stringify(obj))
    }

    //渲染函数
    function paintPlayList(songObj) {
        let temp = `<li class='playlist-item'>
    <div class='playlist-name'>{{title}}</div><div class='playlist-singer'>{{author}}</div>
    <div class="playlist-play fa fa-play" data-listname="{{author}}9%$@a{{title}}"></div>
    <div class="playlist-remove fa fa-times" data-listname="{{author}}9%$@a{{title}}"></div></li>`
        let render = template.compile(temp)
        let html = render(songObj)
        $('.playlist-body').append(html)
        let obj = {
            lastPlay: $('.playlist-play:last').eq(0),
            lastRemove: $('.playlist-remove:last').eq(0)
        }
        return obj
    }
    //获取列表搜索出来的歌曲对象
    function getSearchSong(i) {
        let storage = window.localStorage
        return JSON.parse(storage.getItem(`res${i}`))
    }

    //获取本地列表的歌曲对象
    function getLocalSong(name) {
        return JSON.parse(storage.getItem(name))
    }





    //播放模式逻辑


    function repSwitch() {
        let icon = $('.repeat').eq(0)
        let classContent = icon.attr("class")
        if (classContent.includes("fa-repeat")) {
            icon.toggleClass("fa-random")
            icon.toggleClass("fa-repeat")
        } else if (classContent.includes("fa-random")) {
            icon.toggleClass("fa-long-arrow-right")
            icon.toggleClass("fa-random")
        } else if (classContent.includes("fa-long-arrow-right")) {
            icon.toggleClass("fa-repeat")
            icon.toggleClass("fa-long-arrow-right")
        }
        return icon.attr("class")
    }

    $('.repeat').eq(0).click(function () {
        let status = repSwitch()
        if (status.includes("fa-random")) {
            player.loop = true
        } if (status.includes("fa-repeat")) {
            orderMode()
        }
        if (status.includes("fa-long-arrow-right")) {
            randomMode()
        }
    })

    function orderMode() {
        player.loop = false


        player.onended = playOrd


    }

    function randomMode() {
        player.loop = false
        player.onended = playRand

    }

    function getNowIndex() {
        for (let i = 0; i < storage.length; i++) {
            let listSong = storage.key(i)
            let nowUrl = player.src
            if (!listSong.includes('9%$@a')) continue
            let url = getLocalSong(listSong).url
            if (url == nowUrl) {
                var nowIndex = i
                break
            }
        }
        return nowIndex
    }





    function playRand() {
        let storage = window.localStorage
        var indexArr = []
        for (let i = 0; i < storage.length; i++) {
            let listSong = storage.key(i)
            if (!listSong.includes('9%$@a')) continue
            indexArr.push(i)
        }
        let randNum = Math.floor(Math.random() * indexArr.length)
        let randIndex = indexArr[randNum]
        let randSongName = storage.key(randIndex)
        let nextSong = getLocalSong(randSongName)
        loadSong(nextSong)
    }

    //前进与后退点击事件

    $('.move-on').on('click', function () {
        let icon = $('.repeat').eq(0)
        let classContent = icon.attr("class")
        if (classContent.includes('fa-long-arrow-right')) {
            playRand()
        }
        if (classContent.includes('fa-repeat')) {
            playOrd()
        }
        if (classContent.includes('fa-random')) {
            player.currentTime = 0
            player.play()
        }
    })

    $('.move-back').on('click', function () {
        let icon = $('.repeat').eq(0)
        let classContent = icon.attr("class")
        if (classContent.includes('fa-long-arrow-right')) {
            playRand()
        }
        if (classContent.includes('fa-repeat')) {
            let storage = window.localStorage
            let nowIndex = getNowIndex()
            let readTimes = storage.length
            if (nowIndex == 0) {
                nowIndex = storage.length
            }
            nowIndex--
            while (!storage.key(nowIndex)||!storage.key(nowIndex).includes('9%$@a')) {
                if (nowIndex < 0) {
                    nowIndex = storage.length
                }
                nowIndex--
                readTimes--
                if (readTimes == 0) {
                    alert('您的曲库暂未有音乐，请搜索添加！')
                    return
                }
            }
            let nextSongName = storage.key(nowIndex)
            let nextSong = getLocalSong(nextSongName)
            loadSong(nextSong)
        }
        if (classContent.includes('fa-random')) {
            player.currentTime = 0
            player.play()
        }
    })

    function playOrd() {
        let storage = window.localStorage
        let nowIndex = getNowIndex()
        let readTimes = storage.length
        if (nowIndex == storage.length - 1) {
            nowIndex = -1
        }
        nowIndex++
        while (!storage.key(nowIndex).includes('9%$@a')) {
            if (nowIndex >= storage.length - 1) {
                nowIndex = -1
            }
            nowIndex++
            readTimes--
            if (readTimes == 0) {
                alert('您的曲库暂未有音乐，请搜索添加！')
                return
            }
        }
        let nextSongName = storage.key(nowIndex)
        let nextSong = getLocalSong(nextSongName)
        loadSong(nextSong)
    }

})

//音量调节
$