import React from 'react';
import ReactDOM from 'react-dom';
import { select } from 'd3-selection';
import { transition } from 'd3-transition';
import { easeLinear } from 'd3-ease';
import { zoom } from 'd3-zoom';
import * as d3 from 'd3';
import './index.css';


// let sample = 'qteeicvu--zzygcjheg-tywkvgzf';
let sample = 'qwer-tyuias-dfgh';


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

            if (char == '-' && notes.length != 0) {
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

        let notes = Note.notesFromString(sample, 0);
        console.log("here are the notes");
        console.log(notes);

        this.state = {
            data: notes
        };

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

        select(node).append('g');
        this.createVisualization();
    }

    componentDidUpdate() {
        this.createVisualization();
    }

    animateNodes(nodes) {
        function repeat() {
            nodes.transition()
                .duration(2000)
                .ease(easeLinear)
                .attr('x', function() {
                        let self = select(this);
                        let startX = self.attr('x');
                        return startX - 500;
                    }
                )
                .on('end', repeat);
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
        newNodes
            .attr('height', 15)
            .attr('rx', 0)
            .attr('ry', 0)
            .attr('stroke-width', "1px")
            .attr('width', (note) => {return (note.duration) * 100 - 5 })
            .attr('x', (note) => {return (note.onset - 1) * 100})
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

    debug() {
        this.setState({
            data: this.state.data.concat(this.state.data)
        });
    }

    render() {
        return (
            <div>
                <svg id="display" width="100%" height="100%" ref={node => this.node = node}/>
                <button onClick={() => this.pauseAnimation()}>Pause</button>
                <button onClick={() => this.continueAnimation()}>Continue</button>
                <button onClick={() => this.debug()}>Debug</button>
            </div>
        );
    }
}

ReactDOM.render(<Visualization/>, document.getElementById('root'));

