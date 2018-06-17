import React from 'react';
import ReactDOM from 'react-dom';
import { select } from 'd3-selection';
import { transition } from 'd3-transition';
import { easeLinear } from 'd3-ease';
import { zoom } from 'd3-zoom';
import * as d3 from 'd3';
import './index.css';


class Visualization extends React.Component {
    constructor(props) {
        super(props);
        this.createVisualization = this.createVisualization.bind(this);

        this.state = {
            data: [[1100, 1], [1200, 2], [1300, 3], [1400, 5], [1500,1]]
        };

    }

    componentDidMount() {
        const node = this.node;
        select(node)
            .call(zoom().on("zoom", function () {
                select(node).select('g').attr("transform", 'translate(' + d3.event.transform.x + ' 0)');
            }))
            .append("g");
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

        select(node).select('g').selectAll('rect')
            .attr('width', 50)
            .attr('height', 15)
            .attr('rx', 0)
            .attr('ry', 0)
            .attr('stroke-width', "1px")
            .attr('x', (d) => {return d[0] - 100})
            .attr('y', (d) => {return d[1] * 25 + 100});

        // this.animateNodes(newNodes);

            // .attr('x', (d) => {
            //     console.log("asdf");
            //     return 0;
            // });
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
        let newData = this.state.data.slice();
        this.setState({
            data: newData
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

