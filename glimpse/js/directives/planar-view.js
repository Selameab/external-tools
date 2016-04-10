angular.module('glimpse')
    .directive('planarView', function () {

        function linkDirective(scope, element, attributes) {
            var force = d3.layout.force();

            var update = function (settings) {
                // Size
                d3.select(element[0]).select("svg").attr("width", settings.size.width).attr("height", settings.size.height);
                force.size([settings.size.width, settings.size.height]).resume();

                // Force Params
                force.charge(settings.force.charge);
            };

            scope.$watch('settings', function (settings) {
                update(settings);
            }, true);

            scope.$watch('atoms', function (atoms) {
                element[0].innerHTML = "";
                // Get processed nodes and links
                var graph = processAtoms(atoms);
                console.log(graph)
                var svg = d3.select(element[0])
                    .append("svg:svg")
                    .attr("width", scope.settings.size.width).attr("height", scope.settings.size.height)
                    .call(d3.behavior.zoom().on("zoom", function () {
                        if (scope.tool == 'pan_zoom') svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
                    }))
                    .append("svg:g");

                force.charge(scope.settings.force.charge)
                    .linkDistance(20)
                    .gravity(0.15)
                    .size([scope.settings.size.width, scope.settings.size.height]);


                force.nodes(graph.nodes).links(graph.links).start();
                update(scope.settings);

                var link = svg.selectAll(".link").data(graph.links).enter().append("line").attr("class", "link").attr('id', function(d){ return 'line'+d.source.id+'-'+d.target.id});
                var node = svg.selectAll(".node").data(graph.nodes).enter().append("g").attr('id', function(d){ return 'node'+d.id}).attr("class", function(d){
                    return d.collapsed > 0 ? "node collapsed" : "node";
                })
                    .call(force.drag().on("dragstart", function (d) {
                        if (scope.tool == 'pan_zoom') d3.event.sourceEvent.stopPropagation();
                    }));

                node.append("circle").attr("r", function (d) {
                    return isLink(d) ? 4 : 12;
                });

                node.append("text").attr("dx", 10).attr("dy", ".35em").attr('id', function(d){ return 'txt'+d.id}).text(function (d) {
                    return isLink(d) ? d.type : d.label;
                });

                node.on("click", function (sender) {

                    if (scope.tool == 'select') {
                        if (d3.event.shiftKey || d3.event.ctrlKey) {
                            if (scope.selectedIndices.indexOf(sender.index == -1))
                                scope.selectedIndices.push(sender.index);
                            else
                                scope.selectedIndices.splice(scope.selectedIndices.indexOf(sender.index), 1);
                        } else {
                            scope.selectedIndices = [sender.index];
                        }
                        node.attr("class", function (d) {
                            return scope.selectedIndices.indexOf(d.index) == -1 ? "node" : "node node_selected";
                        });
                    }

                    scope.$apply();
                });
                
                node.on('dblclick', function(sender){                    
                    //var node = findById(graph.nodes, sender.id);
                    graph = removeNodes(graph, sender.id, undefined, 1)
                    console.log(graph)
                });

                force.on("tick", function () {
                    link.attr("x1", function (d) {
                        return d.source.x;
                    }).attr("y1", function (d) {
                        return d.source.y;
                    }).attr("x2", function (d) {
                        return d.target.x;
                    }).attr("y2", function (d) {
                        return d.target.y;
                    });
                    d3.selectAll("circle").attr("cx", function (d) {
                        return d.x;
                    }).attr("cy", function (d) {
                        return d.y;
                    });
                    d3.selectAll("text").attr("x", function (d) {
                        return d.x;
                    }).attr("y", function (d) {
                        return d.y;
                    });

                });

            }, true);

        }

        return {
            link: linkDirective,
            restrict: 'E',
            scope: {atoms: '=', settings: '=', selectedIndices: '=', tool: '='},
            controller: function($scope, AtomsFactory){

            }
        }
    });