import React from 'react';
import ReactDOM from 'react-dom';
import { select } from 'd3-selection';
import { transition } from 'd3-transition';
import { easeLinear } from 'd3-ease';
import { zoom } from 'd3-zoom';
import * as d3 from 'd3';
import './index.css';


// let sample = 'qteeicvu--zzygcjheg-tywkvgzf';
let sample = 'qwer-tyuias-dfghfdyrw';


class Note {
    constructor(pitch, duration, onset) {
        this.pitch = pitch;
        this.duration = duration;
        this.onset = onset;
    }

    static pitchFromChar(char) {
        const pitches = '-qwertyuiasdfghasdfghjkzxcvbnm,';
        const pitch = pitches.indexOf(char);
        if (pitch === -1) {
            throw char + ' is not a valid pitch character';
        }
        return pitch - 1;
    }

    static notesFromString(string, onset) {
        const notes = [];
        let prevChar = '-';
        let currentOnset = onset;

        for (let i = 0; i < string.length; i++) {
            let char = string[i];

            if (char === '-' && notes.length !== 0) {
                notes[notes.length - 1].duration += 1;

            } else {
                let pitch = Note.pitchFromChar(char);
                let note = new Note(pitch, 1, currentOnset);
                notes.push(note);
            }
            prevChar = char;
            currentOnset += 1;
        }
        return notes
    }
}


class Visualization extends React.Component {
    constructor(props) {
        super(props);
        this.createVisualization = this.createVisualization.bind(this);

        this.chunks = [];
        this.appendChunk(sample);
        this.appendChunk(sample);

        this.state = {data: []};
    }

    componentDidMount() {
        const node = this.node;

        // Setup panning
        select(node)
            .call(zoom().on("zoom", function () {
                select(node).select('g').attr("transform", 'translate(' + d3.event.transform.x + ' 0)');
            }))
            // Disable zooming
            .on('dblclick.zoom', null)
            .on('wheel.zoom', null);

        select(node).select('line')
            .attr('style', 'stroke: rgb(230, 230, 230); stroke-width: 2');

        select(node).select('g').select('g').select('rect')
            .attr('x', 100)
            .attr('width', 1000);

        this.updateState();
        this.createVisualization();
    }

    appendChunk(noteString) {
        let currentOffset = 0;
        if (this.chunks.length !== 0)  {
            let lastChunk = this.chunks[this.chunks.length - 1];
            let lastNote = lastChunk[lastChunk.length - 1];

            currentOffset = lastNote.onset + lastNote.duration;
        }

        let notes = Note.notesFromString(noteString, currentOffset);
        this.chunks.push(notes);
    }

    componentDidUpdate() {
        this.createVisualization();
    }

    updateState() {
        this.setState({
            data: [].concat.apply([], this.chunks)
        });
    }

    animateNodes(nodes) {
        function repeat() {
            nodes.transition()
                .duration(20 * 1000)
                .ease(easeLinear)
                .attr('x', function() {
                        let self = select(this);
                        let startX = self.attr('x');
                        return startX - 1000;
                    }
                );
                // .on('end', repeat);
        }
        repeat();
    }

    createVisualization() {
        console.log("creating visualization");
        const node = this.node;

        let rect = select(node).select('g').selectAll('rect')
            .data(this.state.data);
        rect.exit().remove();
        let newNodes = rect.enter().append('rect');

        let currentPixelOffset = 0;
        let firstRect = select(node).select('g').select('rect');

        if (!firstRect.empty()) {
            let xAttr = firstRect.attr('x');
            if (xAttr !== null) {
                currentPixelOffset = parseFloat(xAttr);
            }
        }

        const noteWidth = 30;
        newNodes
            .attr('height', 15)
            .attr('rx', 0)
            .attr('ry', 0)
            .attr('stroke-width', "1px")
            .attr('width', (note) => {return (note.duration) * noteWidth - 5 })
            .attr('x', (note) => {return (note.onset) * noteWidth + currentPixelOffset})
            .attr('y', (note) => {return (note.pitch) * 20 + 100});
    }

    pauseAnimation() {
        const node = this.node;
        select(node).select('g').selectAll('rect').transition();
    }

    continueAnimation() {
        const node = this.node;
        const allNodes = select(node).select('g').selectAll('rect');
        this.animateNodes(allNodes);
    }

    debug1() {
        this.chunks.pop();
        this.updateState();
    }

    debug2() {
        this.appendChunk(sample);
        this.updateState();
    }


    render() {
        return (
            <div>
                <svg id="display" width="100%" height="100%" ref={node => this.node = node}>
                    <g>
                        <g>
                            <rect height="100%" style={{fill: 'blue'}}/>
                        </g>
                    </g>
                    <line x1="350px" y1="0" x2="350px" y2="100%"/>
                </svg>
                <button onClick={() => this.pauseAnimation()}>Pause</button>
                <button onClick={() => this.continueAnimation()}>Continue</button>
                <button onClick={() => this.debug1()}>Debug1</button>
                <button onClick={() => this.debug2()}>Debug2</button>
            </div>
        );
    }
}

ReactDOM.render(<Visualization/>, document.getElementById('root'));

