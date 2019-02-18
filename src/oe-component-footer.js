/**
 * @license
 * ©2018-2019 EdgeVerve Systems Limited (a fully owned Infosys subsidiary),
 * Bangalore, India. All Rights Reserved.
 */
import { html, PolymerElement } from "@polymer/polymer/polymer-element.js";
import "@polymer/iron-flex-layout/iron-flex-layout-classes.js";
import { OECommonMixin } from "oe-mixins/oe-common-mixin.js";
import "@polymer/paper-menu-button/paper-menu-button.js";
import "@polymer/paper-button/paper-button.js";
import "@polymer/paper-icon-button/paper-icon-button.js";
import "@polymer/iron-icon/iron-icon.js";
import "@polymer/iron-icons/iron-icons.js";
import "./oe-component-list.js";
import "./oe-component-navigation-setting.js";
/**
 * `oe-component-footer`
 *  A template element , used to create oe-ui Polymer 3 elements.
 *  By default includes `OECommonMixin` to support use of 'fire','async' and '_deepValue' functions.
 * 
 *
 * @customElement
 * @polymer
 * @appliesMixin OECommonMixin
 * @demo demo/index.html
 */
class OeComponentFooter extends OECommonMixin(PolymerElement) {

  static get is() { return 'oe-component-footer'; }

  static get template() {
    return html`
    <style include="iron-flex iron-flex-alignment">
        :host {
            display: block;
            position: relative;
            font-size: 14px;
            height: 40px;
        }
        

        #menu-panel{
            min-width: 300px;
            height: 500px;
            background: var(--default-primary-color, #222);
            color: var(--default-text-color, #F8F8F8);
        }
        #menu-panel:after {
            content: "";
            position: absolute;
            left: 20px;
            bottom: -10px;
            border-style: solid;
            border-width: 10px 10px 0 10px;
            border-color: var(--default-primary-color) transparent transparent transparent;
        }
        paper-menu-button{
          margin:0px;
          padding:0px;
          --paper-menu-button-content:{
            overflow:visible;
          }
        }
        #trigger-btn{
          font-family: 'Roboto';
          font-size: 14px;
          width:250px;
          background: var(--dark-primary-color);
          color: var(--accent-color);
        }
        #trigger-btn iron-icon{
          --iron-icon-width:16px;
          --iron-icon-height:16px;
          margin:0px 8px;
        }

        [hidden]{
          display: none !important;
        }

        paper-icon-button{

        }
    </style>
    <div class="toolbar-panel layout horizontal justified">
      <paper-menu-button no-animations no-overlap vertical-offset="12" vertical-align="bottom" ignore-select id="pageSelectMenu">
          <paper-button id="trigger-btn" slot="dropdown-trigger">
              <div class="layout horizontal flex center">
                <label hidden=[[selectedComponent.id]]>Create/Manage Components</label>
                <iron-icon hidden=[[selectedComponent.id]] icon="arrow-drop-down"></iron-icon>
                <iron-icon icon="polymer"  hidden=[[!selectedComponent.id]]></iron-icon>
                <label hidden=[[!selectedComponent.id]]>[[selectedComponent.name]]</label>
              </div>
          </paper-button>
          <div id="menu-panel" slot="dropdown-content">
              <oe-component-list 
              id="componentList"
              selected-component={{selectedComponent}}
              on-update-templatelist="_updateTemplateList" 
              on-load-component="_loadComponent"></oe-component-list>
          </div>
      </paper-menu-button>
      <div class="layout horizontal justified center flex" hidden="[[!selectedComponent.id]]">
        <paper-menu-button no-animations no-overlap vertical-offset="12" vertical-align="bottom" ignore-select id="navigationSetting">
          <paper-icon-button slot="dropdown-trigger" noink icon="settings"></paper-icon-button>
          <div id="menu-panel" slot="dropdown-content">
              <oe-component-navigation-setting selected-component={{selectedComponent}}
              on-close-panel="closeNavigationSetting"></oe-component-navigation-setting>
          </div>
        </paper-menu-button>
        <div class="action-panel layout horizontal center">
        <paper-icon-button icon="save" on-tap="_saveComponent"></paper-icon-button>
        <paper-icon-button icon="undo" on-tap="_undoChange" disabled=[[disableUndo]]></paper-icon-button>
        <paper-icon-button icon="redo" on-tap="_redoChange" disabled=[[disableRedo]]></paper-icon-button>
        </div>
      </div>
    </div>
    `;
  }

  static get properties() {
    return {
      module: {
        type: Object
      },
      component:{
        type: Object
      },
      selectedComponent: {
        type: Object,
        value: null
      },
      disableUndo:{
        type: Boolean,
        value:false
      },
      disableRedo:{
        type: Boolean,
        value:false
      }
    };
  }

  _loadComponent(ev) {
    ev.stopPropagation();
    this.$.pageSelectMenu.close();
    this.module.fire("load-uicomponent", ev.detail);
  }

  closeNavigationSetting(){
    this.$.navigationSetting.close();
  }
  _updateTemplateList(ev) {
    ev.stopPropagation();
    this.module.fire("update-templatelist", ev.detail);
  }

  _undoChange(){
    this.module.fire("undo-component-change");
  }

  _redoChange(){
    this.module.fire("redo-component-change");
  }

  _saveComponent(){
    this.$.componentList._updateComponent(this.component);
  }
}

window.customElements.define(OeComponentFooter.is, OeComponentFooter);