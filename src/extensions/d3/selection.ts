import { BaseType } from 'd3';
import * as d3 from 'd3';

declare module 'd3-selection' {
    export interface Selection<GElement extends BaseType, Datum, PElement extends BaseType, PDatum> {
        children(): d3.Selection<GElement, Datum, PElement, PDatum>;
        parent(): d3.Selection<GElement, Datum, PElement, PDatum>;
    }
}

d3.selection.prototype.children = function (this: d3.Selection<BaseType, {}, BaseType, {}>) {
    return this.selectAll(function () {
        let childNodes: NodeList;

        if (this instanceof Element) {
            childNodes = (<Element>this).childNodes;
        } else {
            throw new Error('the current element is not supported');
        }

        const children = new Array<Element>();
        for (let i = 0, l = childNodes.length; i < l; i++) {
            const node = childNodes.item(i);
            if (node instanceof Element) {
                children.push(node);
            }
        }
        return children;
    });
};

d3.selection.prototype.parent = function (this: d3.Selection<BaseType, {}, BaseType, {}>) {
    const node = this.node();
    if (node instanceof Element) {
        return d3.select(node.parentElement);
    } else {
        return null;
    }
};
