import { html } from "../../../../../util/functions/func";
import icon from "../../../icon/icon";
import {
  LOAD,
  CLICK,
  DRAGSTART,
  DRAGOVER,
  DROP,
  PREVENT
} from "../../../../../util/Event";
import { WHITE_STRING } from "../../../../../util/css/types";
import { editor } from "../../../../../editor/editor";
import UIElement, { EVENT } from "../../../../../util/UIElement";
import RangeEditor from "./RangeEditor";
import ColorViewEditor from "./ColorViewEditor";
import { GaussianBlurSVGFilter, SVGFilter } from "../../../../../editor/css-property/SVGFilter";


var filterList = [
  "GaussianBlur",
];

var specList = {
  GaussianBlur: GaussianBlurSVGFilter.spec
};

export default class SVGFilterEditor extends UIElement {

  components() {
    return {
      RangeEditor,
      ColorViewEditor
    }
  }

  initState() {
    return {
      filters: this.props.value || []
    }
  }

  template() {
    return html`
      <div class='filter-editor filter-list'>
          <div class='label' >
              <label>${this.props.title || ''}</label>
              <div class='tools'>
                <select ref="$filterSelect">
                  ${filterList.map(filter => {
                    return `<option value='${filter}'>${filter}</option>`;
                  })}
                </select>
                <button type="button" ref="$add" title="add Filter">${icon.add} ${this.props.title ? '' : 'Add'}</button>
              </div>
          </div>
          <div class='filter-list' ref='$filterList'></div>
      </div>`;
  }

  getSpec(filterType) {
    return specList[filterType];
  }

  makeDropShadowFilterTemplate(spec, filter, index) {
    return html`
      <div class="filter-item">
        <div class="title" draggable="true" data-index="${index}">
          <label>Drop Shadow</label>
          <div class="filter-menu">
            <button type="button" class="del" data-index="${index}">
              ${icon.remove2}
            </button>
          </div>
        </div>

        <div class="filter-ui drop-shadow-color">
          <label>${spec.color.title}</label>
          <ColorViewEditor ref='$dropShadowColorView${index}' params="${index}" color="${filter.color}" onChange="changeDropShadowColor" />
        </div>

        ${["offsetX", "offsetY", "blurRadius"].map(key => {
          return `        
            <div class="filter-ui drop-shadow">
                <label>${spec[key].title}</label>

                <RangeEditor 
                  ref='$${key}${index}' 
                  key="${index}" 
                  params="${key}" 
                  value="${filter[key].value.toString()}" units="${spec[key].units.join(',')}" onchange="changeRangeEditor" />
            </div>`;
        })}
      </div>
    `;
  }

  makeOneFilterTemplate(spec, filter, index) {
    return `
      <div class="filter-item" data-index="${index}">
        <div class="title" draggable="true" data-index="${index}">
          <label>${filter.type}</label>
          <div class="filter-menu">
            <button type="button" class="del" data-index="${index}">${icon.remove2}</button>
          </div>
        </div>
        <div class="filter-ui">

          ${Object.keys(spec).map(key => {
            var s = spec[key]
            return `
              <RangeEditor 
                ref='$range${key}${index}' 
                layout='block' 
                calc='false' 
                label="${s.title}" 
                min="${s.min}"
                max="${s.max}"
                step="${s.step}"
                key="${key}" 
                params="${index}" 
                value="${filter[key]}" 
                units="${s.units.join(',')}" 
                onchange="changeRangeEditor" 
              />`
          }).join(WHITE_STRING)}

        </div>
      </div>
    `;
  }

  makeFilterTemplate(filter, index) {
    return this.makeOneFilterTemplate(
      this.getSpec(filter.type),
      filter,
      index
    );
  }

  [LOAD("$filterList")]() {
    return this.state.filters.map((filter, index) => {
      return this.makeFilterTemplate(filter, index.toString());
    });
  }

  // filter-item 을 통째로  dragstart 를 걸어버리니깐
  // 다른 ui 를 핸들링 할 수가 없어서
  // title  에만 dragstart 거는 걸로 ok ?
  [DRAGSTART("$filterList .filter-item .title")](e) {
    this.startIndex = +e.$delegateTarget.attr("data-index");
  }

  // drop 이벤트를 걸 때 dragover 가 같이 선언되어 있어야 한다.
  [DRAGOVER("$filterList .filter-item") + PREVENT](e) {}



  sortItem(arr, startIndex, targetIndex) {
    arr.splice(
      targetIndex + (startIndex < targetIndex ? -1 : 0),
      0,
      ...arr.splice(startIndex, 1)
    );
  }

  sortFilter(startIndex, targetIndex) {
      this.sortItem(this.state.filters, startIndex, targetIndex);
  }

  [DROP("$filterList .filter-item") + PREVENT](e) {
    var targetIndex = +e.$delegateTarget.attr("data-index");
    var current = editor.selection.current;
    if (!current) return;

    this.sortFilter(this.startIndex, targetIndex);

    this.refresh();

    this.modifyFilter()
  }

  modifyFilter () {
    this.parent.trigger(this.props.onchange, this.props.key, this.state.filters)
  }

  makeFilter(type, opt = {}) {
    return SVGFilter.parse({ ...opt, type });
  }

  [CLICK("$add")]() {
    var filterType = this.refs.$filterSelect.value;

    this.state.filters.push(this.makeFilter(filterType))

    this.refresh();

    this.modifyFilter()
  }

  [CLICK("$filterList .filter-menu .del")](e) {
    var index = +e.$delegateTarget.attr("data-index");
    this.state.filters.splice(index, 1);

    this.refresh();

    this.modifyFilter()
  }

  [EVENT("changeDropShadowColor")](color, params) {
    var index = +params;

    this.state.filters[index].reset({
      color
    });

    this.modifyFilter();

  }

  [EVENT('changeRangeEditor')] (key, value, params) {
    var filter =  this.state.filters[+params];
    if (filter) {
      filter.reset({
        [key]: value
      })
    }
  
    this.modifyFilter();
  }
}