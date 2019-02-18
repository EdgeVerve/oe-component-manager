/**
 * @license
 * ©2018-2019 EdgeVerve Systems Limited (a fully owned Infosys subsidiary),
 * Bangalore, India. All Rights Reserved.
 */
import { html, PolymerElement } from "@polymer/polymer/polymer-element.js";
import { OEAjaxMixin } from "oe-mixins/oe-ajax-mixin.js";
import "@polymer/polymer/lib/elements/dom-repeat.js";
import "@polymer/iron-flex-layout/iron-flex-layout-classes.js";
import "@polymer/iron-pages/iron-pages.js";
import "@polymer/iron-icon/iron-icon.js";
import "@polymer/iron-icons/iron-icons.js";
import "@polymer/paper-tooltip/paper-tooltip.js";
import "oe-input/oe-input.js";
import "./oe-component-creator.js";
/**
 * `oe-component-list`
 *  A template element , used to create oe-ui Polymer 3 elements.
 *  By default includes `OECommonMixin` to support use of 'fire','async' and '_deepValue' functions.
 * 
 *
 * @customElement
 * @polymer
 * @appliesMixin OEAjaxMixin
 * @demo demo/index.html
 */
class OeComponentList extends OEAjaxMixin(PolymerElement) {

  static get is() { return 'oe-component-list'; }

  static get template() {
    return html`
    <style include="iron-flex iron-flex-alignment">
        :host {
            display: block;
            position: relative;
            font-size:14px;
            letter-spacing: 0.7px;
        }

        .list-detail{
            padding: 0px 8px;
            border-bottom: 1px solid #BBB;
            height: 40px;
            box-sizing: border-box;
        }
        .list-detail iron-icon{
            margin-left:8px;
        }
        iron-icon{
            --iron-icon-width: 18px;
            --iron-icon-height: 18px;
        }

        
        .list-item {
            height: 48px;
            padding: 0 16px;
            cursor: pointer;
            position: relative;
            color: var(--default-text-color);
        }

        iron-icon + .page-name{
            margin:0px 8px;
        }

        .page-name {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .options {
            position: absolute;
            visibility: hidden;
            right: 0;
            height: 48px;
            padding: 0 16px;
            background: var(--default-primary-color);
        }

        .options iron-icon {
            margin-left: 8px;
        }

        .list-item:hover .options {
            visibility: visible;
        }

        .list-item.iron-selected {
            background: var(--dark-primary-color);
            color: var(--accent-color);
        }

        .list-item.iron-selected .options {
            background: var(--dark-primary-color);
        }


        .list-item:hover {
            box-shadow: 1px 2px 1px rgba(0, 0, 0, 0.20), 1px -2px 1px rgba(0, 0, 0, 0.20);
        }

        .components-list{
            max-height:420px;
            overflow:auto;
        }


        #search-section {
            height: 36px;
            padding: 0px 16px;
            box-sizing: border-box;
            background: var(--light-primary-color);
        }

        #search-section #input {
            border: none;
            outline: none;
            width: 100%;
            background: inherit;
            padding: 5px 8px;
            margin: 0px;
            height: 36px;
            box-sizing: border-box;
            color: var(--default-text-color);
        }

        #input::-webkit-input-placeholder {
            color: rgba(255, 255, 255, 0.54);
        }

        #input::-moz-placeholder {
            color: rgba(255, 255, 255, 0.54);
        }

        #input:-ms-input-placeholder {
            color: rgba(255, 255, 255, 0.54);
        }

        #empty-panel{
            text-align: center;
            font-size: 18px;
            height: 300px;
            width: 300px;
            box-sizing: border-box;
            padding: 32px 16px;
            word-break: break-word;
            line-height: 30px;
        }
    </style>
    <div>
        <iron-pages selected=[[_selectedView]] attr-for-selected="view-type">
            <div id="component-listing-panel" view-type="list-mode">
                <div class="list-detail layout horizontal center">
                    <label class="flex">Components Found [[componentList.length]]</label>
                    <iron-icon icon="refresh" on-tap="_fetchUIComponents"></iron-icon>
                    <iron-icon icon="add" on-tap="_addUIComponent"></iron-icon>
                </div>
                <div class="list-section" hidden=[[!componentList.length]]>
                <div id="search-section" class="layout horizontal center justified">
                    <iron-icon icon="search" slot="prefix"></iron-icon>
                    <iron-input bind-value="{{searchKey}}" class="flex">
                        <input type="search" placeholder="Search Components..." id="input" autocomplete="off">
                    </iron-input>
                </div>
                <div class="components-list">
                    <dom-repeat items=[[componentList]] as="page" filter="{{_filterComponents(searchKey)}}">
                        <template>
                        <div id$="id_[[page.id]]" name$="[[page.name]]" 
                        class$="list-item layout horizontal center justified [[_isActivePage(selectedComponent,page)]]"
                        on-tap="_editPage">
                            <iron-icon icon="polymer"></iron-icon>
                            <span class="flex page-name">[[page.name]]</span>
                            <template is="dom-if" if="{{page.scope}}">
                                <span class="scope-text">{ ... }</span>
                            </template>
                            <div class="options layout horizontal center">
                                <iron-icon icon="file-download" on-tap="_downloadComponent"></iron-icon>
                                <iron-icon icon="delete" on-tap="_deleteComponent"></iron-icon>
                            </div>
                            <template is="dom-if" if="{{page.scope}}">
                                <paper-tooltip for="id_{{page.id}}">
                                    <pre>{{_formatJSON(page.scope)}}</pre>
                                </paper-tooltip>
                            </template>
                        </div>
                        </template>
                    </dom-repeat>
                </div>
                </div>
                <div class="list-section" id="empty-panel" hidden=[[componentList.length]]>
                    <label>No Components found, to start click the + icon above</label>
                </div>
            </div>
            <oe-component-creator id="creator" view-type="create-mode" on-component-created="_componentCreated"></oe-component-creator>
        </iron-pages>
    </div>
    `;
  }

  static get properties() {
    return {
      selectedComponent: {
        type: Object,
        notify: true
      }
    };
  }


  constructor() {
    super();
    this.componentList = [];
    this._selectedView = "list-mode";
    this._fetchUIComponents();
  }

  _fetchUIComponents() {
    this.makeAjaxCall('api/UIComponents', 'GET', null, null, null, null, function (err, resp) {
      if (err) {
        this.fire('oe-show-error', "Error fetching components list");
      } else {
        this.set('componentList', resp || []);
      }
    }.bind(this));
  }
  _addUIComponent() {
    this.set('_selectedView', "create-mode");
    this.$.creator._resetFields();
  }
  _filterComponents(searchKey) {
    return function (model) {
      if (!searchKey) {
        return true;
      }
      if (!model) {
        return false;
      }
      return model.name.toLowerCase().indexOf(searchKey.toLowerCase()) != -1;
    };
  }
  _isActivePage(selectedComponent, curPage) {
    return selectedComponent && selectedComponent.id === curPage.id ? 'iron-selected' : '';
  }
  _formatJSON(obj) {
    return JSON.stringify(obj, null, 2);
  }

  _componentCreated(e) {
    var comp = e.detail;
    this.push('componentList', comp);
    this.__loadPage(comp);
  }

  _editPage(e) {
    var comp = e.model.page;
    this.__loadPage(comp);
  }

  __loadPage(comp) {
    if (comp && comp.id) {
      this.set('selectedComponent', comp);
    } else {
      this.set('selectedComponent', null);
    }
    this.fire("load-component", comp);
    this._selectedView = "list-mode";
  }

  _updateComponent(comp){
    var self = this;
    var apiurl = window.OEUtils._getRestApiUrl('/UIComponents');
    this.makeAjaxCall(apiurl, 'put', comp, null, null, function (err, res) {
        if (!err) {
            var idx = self.componentList.findIndex(function(c){
                return c.id === comp.id;
            });
            self.set('componentList.'+idx,res);
            self.fire('oe-show-success', 'Component successfully updated');
            self.__loadPage(comp);
        } else {
            self.resolveError(err);
        }
    });
  }
}

window.customElements.define(OeComponentList.is, OeComponentList);