import * as d3 from 'd3';

export function lasso() {

    let closePathDistance = 75,
        closePathSelect = true,
        isPathClosed = false,
        hoverSelect = true,
        targetArea,
        on = {start: function(){}, draw: function(){}, end: function(){}};

    let drawnCoords;

    // Function to execute on call
    function lasso(_this) {

        // add a new group for the lasso
        let g = _this.append("g")
            .attr("class", "lasso")

        // add the drawn path for the lasso
        let dyn_path = g.append("path")
            .attr("class", "drawn")
            .style('stroke', 'rgb(80, 80, 80)')
            .style('stroke-width', '1px')
            .style('fill-opacity', 0.05);

        // add a closed path
        let close_path = g.append("path")
            .attr("class", "loop_close")
            .style('stroke', 'rgb(80, 80, 80)')
            .style('stroke-width', '1px')
            .style('fill', 'none')
            .style('stroke-dasharray', '4 4');

        // add an origin node
        let origin_node = g.append("circle")
            .attr("class", "origin");

        // The transformed lasso path for rendering
        let tpath;

        // The lasso origin for calculations
        let origin;

        // The transformed lasso origin for rendering
        let torigin;

         // Apply drag behaviors
        let dragAction = d3.drag()
            .on("start", dragstart)
            .on("drag", dragmove)
            .on("end", dragend);

        // Call drag
        targetArea.call(dragAction);

        function dragstart() {
            // Init coordinates
            drawnCoords = [];

            // Initialize paths
            tpath = "";
            dyn_path.attr("d",null);
            close_path.attr("d",null);

            // Run user defined start function
            on.start();
        }

        function dragmove() {
            // Get mouse position within body, used for calculations
            let x,y;
            let event = d3.event;
            if (event.sourceEvent.type === "touchmove") {
                x = event.sourceEvent.touches[0].clientX;
                y = event.sourceEvent.touches[0].clientY;
            }
            else {
                x = event.sourceEvent.clientX;
                y = event.sourceEvent.clientY;
            }

            let tx = d3.mouse(this)[0];
            let ty = d3.mouse(this)[1];

            // Initialize the path or add the latest point to it
            if (tpath==="") {
                tpath = tpath + "M " + tx + " " + ty;
                origin = [x,y];
                torigin = [tx,ty];
                // Draw origin node
                origin_node
                    .attr("cx",tx)
                    .attr("cy",ty)
                    .attr("r",4)
                    .attr("display",null);
            }
            else {
                tpath = tpath + " L " + tx + " " + ty;
            }

            // drawnCoords.push([x,y]);
            drawnCoords.push([tx, ty]);

            // Calculate the current distance from the lasso origin
            let distance = Math.sqrt(Math.pow(x-origin[0],2)+Math.pow(y-origin[1],2));

            // Set the closed path line
            let close_draw_path = "M " + tx + " " + ty + " L " + torigin[0] + " " + torigin[1];

            // Draw the lines
            dyn_path.attr("d", tpath);

            close_path.attr("d", close_draw_path);

            // Check if the path is closed
            isPathClosed = distance<=closePathDistance ? true : false;

            // If within the closed path distance parameter, show the closed path. otherwise, hide it
            if(isPathClosed && closePathSelect) {
                close_path.attr("display",null);
            }
            else {
                close_path.attr("display","none");
            }

            on.draw();
        }

        function dragend() {
            // Clear lasso
            dyn_path.attr("d", null);
            close_path.attr("d", null);
            origin_node.attr("display", "none");

            // Run user defined end function
            on.end();
        }
    }

    lasso.getPath = function() {
        return drawnCoords;
    }

    // Distance required before path auto closes loop
    lasso.closePathDistance  = function(_) {
        if (!arguments.length) return closePathDistance;
        closePathDistance = _;
        return lasso;
    };

    // Option to loop select or not
    lasso.closePathSelect = function(_) {
        if (!arguments.length) return closePathSelect;
        closePathSelect = _===true ? true : false;
        return lasso;
    };

    // Not sure what this is for
    lasso.isPathClosed = function(_) {
        if (!arguments.length) return isPathClosed;
        isPathClosed = _===true ? true : false;
        return lasso;
    };

    // Option to select on hover or not
    lasso.hoverSelect = function(_) {
        if (!arguments.length) return hoverSelect;
        hoverSelect = _===true ? true : false;
        return lasso;
    };

    // Events
    lasso.on = function(type,_) {
        if(!arguments.length) return on;
        if(arguments.length===1) return on[type];
        let types = ["start", "draw", "end"];
        if(types.indexOf(type)>-1) {
            on[type] = _;
        }
        return lasso;
    };

    // Area where lasso can be triggered from
    lasso.targetArea = function(_) {
        if(!arguments.length) return targetArea;
        targetArea = _;
        return lasso;
    }

    return lasso;
};
