
function get(url, payload, callback) {
    http('GET', url, payload, callback);
}

function post(url, payload, callback) {
    http('POST', url, payload, callback);
}

function http(method, url, payload, callback) {
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            const response = JSON.parse(xhr.responseText);
            callback(xhr.status, response);
        }
    };
    xhr.send(JSON.stringify(payload));
}

export class Boot {
    preload() {
        this.load.image('preloaderBar', 'static/i/preload.png');
    }

    create() {
        this.input.maxPointers = 1;
        this.stage.disableVisibilityChange = true;
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.enterIncorrectOrientation.add(this.enterIncorrectOrientation, this);
        this.scale.leaveIncorrectOrientation.add(this.leaveIncorrectOrientation, this);
        this.onSizeChange();
        this.state.start('Preloader');
    }

    onSizeChange() {
        this.scale.minWidth = 480;
        this.scale.minHeight = 270;
        let device = this.game.device;
        if (device.android || device.iOS) {
            this.scale.maxWidth = window.innerWidth;
            this.scale.maxHeight = window.innerHeight;
        } else {
            this.scale.maxWidth = 960;
            this.scale.maxHeight = 540;
        }
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;
        this.scale.forceOrientation(true);
    }

    enterIncorrectOrientation() {
        // orientated = false;
        document.getElementById('orientation').style.display = 'block';
    }

    leaveIncorrectOrientation() {
        // orientated = true;
        document.getElementById('orientation').style.display = 'none';
    }
}

export class Preloader {

    preload() {
        this.preloadBar = this.game.add.sprite(120, 200, 'preloaderBar');
        this.load.setPreloadSprite(this.preloadBar);

        this.load.audio('music_room', 'static/audio/bg_room.mp3');
        this.load.audio('music_game', 'static/audio/bg_game.ogg');
        this.load.audio('music_deal', 'static/audio/deal.mp3');
        this.load.audio('music_win', 'static/audio/end_win.mp3');
        this.load.audio('music_lose', 'static/audio/end_lose.mp3');
        this.load.audio('f_score_0', 'static/audio/f_score_0.mp3');
        this.load.audio('f_score_1', 'static/audio/f_score_1.mp3');
        this.load.atlas('btn', 'static/i/btn.png', 'static/i/btn.json');
        this.load.image('bg', 'static/i/bg.png');
        this.load.spritesheet('poker', 'static/i/poker.png', 90, 120);
        this.load.json('rule', 'static/rule.json');
    }

    create() {
        const that = this;
        get('/userinfo', {}, function (status, response) {
            if (status === 200) {
                window.playerInfo = response;
                if (response['uid']) {
                    that.state.start('MainMenu');
                } else {
                    that.state.start('Login');
                }
            } else {
                that.state.start('Login');
            }
        });
        const music = this.game.add.audio('music_room');
        music.loop = true;
        music.loopFull();
        music.play();
    }
}

export class MainMenu {
    create() {
        this.stage.backgroundColor = '#182d3b';
        let bg = this.game.add.sprite(this.game.width / 2, 0, 'bg');
        bg.anchor.set(0.5, 0);

        const centerX = this.game.world.width / 2;
        const centerY = this.game.world.height / 2;

        // 欢迎文字
        let style = {font: "28px Arial", fill: "#fff", align: "right"};
        let text = this.game.add.text(this.game.world.width - 4, 4, "欢迎回来 " + window.playerInfo.name, style);
        text.addColor('#cc00cc', 4);
        text.anchor.set(1, 0);

        // 菜单按钮
        this.addMenuButton(centerX, centerY - 80, '创 建 房 间', 0x4CAF50, this.gotoCreateRoom);
        this.addMenuButton(centerX, centerY,      '加 入 房 间', 0x2196F3, this.gotoJoinRoom);
        this.addMenuButton(centerX, centerY + 80, '人 机 对 战', 0xFF9800, this.gotoAiRoom);
    }

    addMenuButton(x, y, label, color, callback) {
        const gfx = this.game.add.graphics(0, 0);
        gfx.beginFill(color, 0.9);
        gfx.drawRoundedRect(x - 130, y - 26, 260, 52, 10);
        gfx.endFill();
        gfx.inputEnabled = true;
        gfx.input.useHandCursor = true;
        gfx.events.onInputDown.add(callback, this);

        const txt = this.game.add.text(x, y, label, {
            font: "bold 26px Arial", fill: "#ffffff", align: "center"
        });
        txt.anchor.set(0.5);
        txt.setShadow(1, 1, 'rgba(0,0,0,0.5)', 2);
    }

    gotoCreateRoom() {
        this.state.start('Game', true, false, {mode: 'create'});
    }

    gotoJoinRoom() {
        const code = prompt('请输入4位房间号：');
        if (code) {
            const roomId = parseInt(code);
            if (roomId >= 1000 && roomId <= 9999) {
                this.state.start('Game', true, false, {mode: 'join', room: roomId});
            } else {
                alert('房间号应为4位数字');
            }
        }
    }

    gotoAiRoom() {
        this.state.start('Game', true, false, {mode: 'ai'});
    }
}

export class Login {
    create() {
        this.stage.backgroundColor = '#182d3b';
        let bg = this.game.add.sprite(this.game.width / 2, 0, 'bg');
        bg.anchor.set(0.5, 0);

        this.game.add.plugin(PhaserInput.Plugin);
        const style = {
            font: '32px Arial', fill: '#000', width: 300, padding: 12,
            borderWidth: 1, borderColor: '#c8c8c8', borderRadius: 2,
            textAlign: 'center', placeHolder: '请输入用户名'
        };
        this.name = this.game.add.inputField((this.game.world.width - 300) / 2, this.game.world.centerY - 40, style);

        this.errorText = this.game.add.text(this.game.world.centerX, this.game.world.centerY + 24, '', {
            font: "24px Arial",
            fill: "#f00",
            align: "center"
        });
        this.errorText.anchor.set(0.5, 0);

        let login = this.game.add.button(this.game.world.centerX, this.game.world.centerY + 100, 'btn', this.onLogin, this, 'login.png', 'login.png', 'login.png');
        login.anchor.set(0.5);
    }

    onLogin() {
        this.errorText.text = '';
        if (!this.name.value) {
            this.name.startFocus();
            this.errorText.text = '请输入用户名';
            return;
        }
        let that = this;
        const payload = {
            "name": this.name.value,
        };
        post('/login', payload, function (status, response) {
            if (status === 200) {
                window.playerInfo = response;
                that.state.start('MainMenu');
            } else {
                that.errorText.text = response.detail;
            }
        })
    }
}