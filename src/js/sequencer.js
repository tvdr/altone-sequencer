import * as Tone from "tone";

const synthnotes = [
    'C2', 'D2', 'E2', 'F2', 'G2', 'A2', 'B2',
    'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3',
];

const instruments = {
    0: "BD.wav",
    1: "CB.wav",
    2: "CH.wav",
    3: "CL.wav",
    4: "CP.wav",
    5: "CY.wav",
    6: "HC.wav",
    7: "HT.wav",
    8: "LC.wav",
    9: "LT.wav",
    10: "MA.wav",
    11: "MC.wav",
    12: "MT.wav",
    13: "OH.wav",
    14: "RS.wav",
    15: "SD.wav",
};

const players = new Tone.Players({
    urls: instruments,
    fadeOut: "64n",
    baseUrl: "/audio/"
}).toDestination();


let synths = [];

export default () => ({
    init() {

        Tone.Transport.bpm.value = this.bpm;
        this.sequencer = new Tone.Sequence(this._tick.bind(this), this._indexArray(this.columns), this.subdivision).start(0);
        this.matrix = this._indexArray(this.columns).map(() => {
            return this._indexArray(Object.keys(this.instruments).length).map(() => false);
        });
        this.def_synthmatrix = this._indexArray(this.columns).map(() => {
            return this._indexArray(Object.keys(this.instruments).length).map(() => false);
        });

        this.$watch('bpm', () => {
            Tone.Transport.bpm.value = this.bpm;
        });

        this.synths[0] = {
            params: JSON.parse(JSON.stringify(this.def_synthparams)),
            matrix: JSON.parse(JSON.stringify(this.def_synthmatrix)),
            synth: new Tone.MonoSynth(this.def_synthparams).toDestination()
        }


    },

    tab: 'drums',
    columns: 16,
    highlighted: -1,
    bpm: 120,
    started: false,
    subdivision: '16n',
    savename: 'sequence_1',
    instruments,
    synthnotes,
    synths,


    def_synthparams: {
        oscillator: {
            type: "square"
        },
        envelope: {
            attack: 0.1
        },
        filter: {frequency: 5500, type: "lowpass"},
        volume: 10,
    },

    solo: false,
    mutes: [],


    start() {
        if (Tone.context.state !== 'running') {
            Tone.context.resume();
        }
        Tone.Transport.start();
        this.started = true;
    },

    stop() {
        Tone.Transport.stop();
        this.started = false;
        this.highlighted = -1;
    },

    save() {
        localStorage.setItem(this.savename, JSON.stringify(this.matrix));
    },
    load() {
        this.matrix = JSON.parse(localStorage.getItem(this.savename));
    },
    clear() {
        this.matrix = this._indexArray(this.columns).map(() => {
            return this._indexArray(Object.keys(this.instruments).length).map(() => false);
        });
    },

    updatecell(col, instrument) {
        this.matrix[col - 1][instrument] = !this.matrix[col - 1][instrument];
    },


    updatesynthcell(col, row, note, skey) {
        if (this.synths[skey].matrix[col - 1][row] === false) {
            this.synths[skey].matrix[col - 1][row] = note;
        } else {
            this.synths[skey].matrix[col - 1][row] = false;
        }
    },

    addsynth() {
        this.synths.push({
            params: JSON.parse(JSON.stringify(this.def_synthparams)),
            matrix: JSON.parse(JSON.stringify(this.def_synthmatrix)),
            synth: new Tone.MonoSynth(this.def_synthparams).toDestination()
        })

        this.tab = 'synth_' + (this.synths.length - 1)
    },

    reloadsynth(synth) {
        synth.synth = new Tone.MonoSynth(synth.params).toDestination()
    },

    setSolo(row) {
        let introw = parseInt(row);
        if (this.solo === introw) {
            this.solo = false;
        } else {
            this.solo = introw;
        }
    },

    toggleMute(row) {
        let introw = parseInt(row);
        if (this.mutes.includes(introw)) {
            this.mutes = this.mutes.filter(item => item !== introw)
        } else {
            this.mutes.push(introw);
        }
    },

    _indexArray(count) {
        const indices = [];
        for (let i = 0; i < count; i++) {
            indices.push(i);
        }
        return indices;
    },

    _tick(time, index) {

        let _this = this;
        Tone.Draw.schedule(() => {
            if (_this.started) {
                _this.highlighted = index;
            }
        }, time);

        this.matrix[index].forEach((value, row) => {
            if (parseInt(_this.solo) === parseInt(row) || _this.solo === false) {
                if (!_this.mutes.includes(row)) {
                    if (value) {
                        players.player(row).start(time, 0, "16t");
                    }
                }
            }
        });

        this.synths.forEach((s) => {
            s.matrix[index].forEach((value, row) => {
                if (value !== false) {
                    Alpine.raw(s).synth.triggerAttackRelease(value, '16t');
                }
            });


        })


    }
})
