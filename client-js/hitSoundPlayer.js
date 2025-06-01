export class HitSoundPlayer {
    constructor(game) {
        this.game = game;

        this.hitsounds = {
            0: {
                0: 'normal-hitnormal',
                1: 'normal-hitwhistle',
                2: 'normal-hitfinish',
                3: 'normal-hitclap',
            },

            1: {
                0: 'normal-hitnormal',
                1: 'normal-hitwhistle',
                2: 'normal-hitfinish',
                3: 'normal-hitclap',
            },

            2: {
                0: 'soft-hitnormal',
                1: 'soft-hitwhistle',
                2: 'soft-hitfinish',
                3: 'soft-hitclap',
            },

            3: {
                0: 'drum-hitnormal',
                1: 'drum-hitwhistle',
                2: 'drum-hitfinish',
                3: 'drum-hitclap',
            }
        }
    }

    /**
     * https://osu.ppy.sh/wiki/hu/Client/File_formats/osu_%28file_format%29#hitsounds
     * @param {Number} normal 
     * @param {Number} addition
     * @param {Number} hitSound
     */
    playHitSound(normal = 0, addition = 0, hitSound) {
        this.game.auMgr.playAudioClip(this.hitsounds[normal][0]);

        for (let i = 0; i < 4; i++) {
            let a = (hitSound & (1 << i)) !== 0;
            if (a) this.game.auMgr.playAudioClip(this.hitsounds[addition][i]);
        }

    }
}