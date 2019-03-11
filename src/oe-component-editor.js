/**
 * @license
 * ©2018-2019 EdgeVerve Systems Limited (a fully owned Infosys subsidiary),
 * Bangalore, India. All Rights Reserved.
 */
import { html, PolymerElement } from "@polymer/polymer/polymer-element.js";
import "@polymer/iron-flex-layout/iron-flex-layout-classes.js";
import "@polymer/iron-flex-layout/iron-flex-layout.js";
import { OEAjaxMixin } from "oe-mixins/oe-ajax-mixin.js";
import "oe-combo/oe-combo.js";
import "oe-input/oe-input.js";
import "oe-checkbox/oe-checkbox.js";
import "./oe-component-field-editor.js";
import "./oe-component-container-editor.js";

/**
 * `oe-component-editor`
 *  A template element , used to create oe-ui Polymer 3 elements.
 *  By default includes `OECommonMixin` to support use of 'fire','async' and '_deepValue' functions.
 * 
 *
 * @customElement
 * @polymer
 * @appliesMixin OEAjaxMixin
 * @demo demo/index.html
 */
class OeComponentEditor extends OEAjaxMixin(PolymerElement) {

  static get is() { return 'oe-component-editor'; }

  static get template() {
    return html`
    <style include="iron-flex iron-flex-alignment">
      :host{
        position: relative;
        display: block;
        box-sizing: border-box;
        background: var(--default-primary-color);
        color: #fff;
        box-shadow: 0px -2px 1px rgba(0, 0, 0, 0.61) inset;
        height: 100%;
        --paper-input-container-shared-input-style : #FFF;
      }

      #heading-section{
        height: 40px;
        padding: 0px 16px;
      }

      .section-heading{
        padding: 0px 16px;
        font-size:16px;
        height:36px;
        box-shadow: 0px 2px 1px 1px rgba(0, 0, 0, 0.2);
        background: var(--light-primary-color);
      }

      .section-heading iron-icon{
        --iron-icon-width:18px;
        --iron-icon-height:18px;
        cursor:pointer;
      }
      .section-detail{
        padding:16px;
      }

      .horz-center{
        @apply --layout-horizontal;
        @apply --layout-center;
        @apply --layout-justified;
      }

      .dark-input{
        color:#FFF;
        --paper-input-container-color:#AAA;
        --paper-checkbox-label-color:#FFF;
        --paper-checkbox-checked-color:#FFF;
        --paper-checkbox-checkmark-color:var(--light-primary-color);
        --paper-input-container-focus-color:#FFF;
        --paper-input-container-shared-input-style:{
          color:#FFF;
        }
      }

      .section-info{
        display: block;
        margin-bottom: 8px;
      }
    </style>
    <iron-pages selected="[[_selectedView]]" attr-for-selected="view">
      <div view="component">
        <div id="heading-section" class="horz-center">
          <label>Component Name : [[component.name]] </label>
        </div>
        <div>
          <div class="component-section template-panel">
            <div class="section-heading horz-center">
              <label>Component settings</label>
            </div>
            <div class="section-detail">
             <!-- <oe-input class="dark-input" label="Rest URL" value="{{component.restUrl}}"></oe-input> -->
              <oe-combo class="dark-input" label="Template Name" listdata="[[templateList]]" value="{{component.templateName}}" valueproperty="file" displayproperty="file"></oe-combo>
            </div>
          </div>
          <div class="component-section model-panel">
            <div class="section-heading horz-center">
              <label>Model binding</label>
            </div>
            <div class="section-detail">
            <oe-combo class="dark-input" id="modelName" show-refresh value="{{component.modelName}}" label="Models" displayproperty="name" valueproperty="name"
            listurl="[[_getRestApiUrl('/ModelDefinitions?filter[fields][name]=true')]]"></oe-combo>
            <oe-checkbox class="dark-input" label="Auto Inject fields" value={{component.autoInjectFields}}></oe-checkbox>
            </div>
          </div>
          <div class="component-section field-panel">
            <div class="section-heading horz-center">
              <label>Fields Array</label>
              <iron-icon icon="settings" on-tap="_gotoFieldEditor"></iron-icon>
            </div>
            <div class="section-detail">
              <label class="section-info">Fields added : [[component.fields.length]]</label>
              <label class="section-info">Excluded fields : [[component.excludeFields.length]]</label>
            </div>
          </div>
          <div class="component-section container-panel">
              <div class="section-heading horz-center">
                <label>Containers Array</label>
                <iron-icon icon="settings"  on-tap="_gotoContainerEditor"></iron-icon>
              </div>
              <div class="section-detail">
                <label class="section-info">Containers present : [[_getContainerCount(component.container.*)]]</label>
              </div>
          </div>
        </div>
      </div>
    <div view="field">
      <div id="heading-section" class="horz-center">
        <iron-icon icon="arrow-back" on-tap="_gotoComponentEditor"></iron-icon>
        <label>[[component.name]] - fields</label>
        <iron-icon icon="save" on-tap="_saveFieldsArray"></iron-icon>
      </div>
      <oe-component-field-editor id="fieldEditor" meta-data=[[metaData]] containers=[[containers]] component=[[component]]></oe-component-field-editor>
    </div>
    <div view="container">
      <div id="heading-section" class="horz-center">
        <iron-icon icon="arrow-back" on-tap="_gotoComponentEditor"></iron-icon>
        <label>[[component.name]] - containers</label>
        <iron-icon icon="save" on-tap="_saveContainerArray"></iron-icon>
      </div>
      <oe-component-container-editor id="containerEditor" container="[[component.container]]"></oe-component-container-editor>
    </div>
    </iron-pages>
    `;
  }

  static get properties() {
    return {
      metaData: {
        type: Object
      },
      component: {
          type: Object,
          value:function(){
            return {};
          }
      },
      templateList:{
          type:Array,
          value:function(){
          return [];
        }
      },
      containers: {
        type: Array,
        value: function () {
          return [];
        }
      }
    };
  }

  static get observers(){
    return ["_componentChanged(component.*)"];
  }

  constructor(){
    super();
    this._reset();
  }

  _reset(){
    this.set("_selectedView","component");
  }

  _getContainerCount(){
    if(!this.component){
      return 0;
    }
    var container = this.component.container;
    if(container && Array.isArray(container.steps)){
      return container.steps.length;
    }
    return 0;
  }

  _configField(fieldObj){
    if(fieldObj && fieldObj.length > 0){
      this._gotoFieldEditor();
      this.$.fieldEditor._configField(fieldObj);
    }
  }
  _gotoComponentEditor() {
    this.set("_selectedView", "component");
    this.fire("update-preview-class","expanded-view");
  }

  _gotoFieldEditor() {
    this.$.fieldEditor._setComponentFields();
    this.set("_selectedView", "field");
    this.fire("update-preview-class","compressed-view");
  }

  _gotoContainerEditor() {
    this.$.containerEditor._setComponentContainers();
    this.set("_selectedView", "container");
    this.fire("update-preview-class","compressed-view");
  }

  _saveContainerArray() {
    var detail = this.$.containerEditor._getContainer();

    if (!detail.valid) {
      this.fire("oe-show-error", detail.error);
      return;
    }

    this.set("component.container", Object.assign({}, detail.result));

    this._gotoComponentEditor();
  }

  _saveFieldsArray() {
    var detail = this.$.fieldEditor._getField();
    if (!detail.valid) {
      this.fire("oe-show-error", detail.error);
      return;
    }
    this.set("component.excludeFields", detail.result.excludeFields.slice());
    this.set("component.fields", detail.result.fields.slice());
    this._gotoComponentEditor();
  }


  _componentChanged(delta) {
    var changePath = delta.path;
    switch(changePath){
      case "component" : 
          if (this.component && this.component.id) {
            this._gotoComponentEditor();
          } else {
            this.fire("update-preview-class", "full-view");
          }
          break;
      case "component.modelName" : 
          this.fire("oe-show-confirm",{
            message:'Clear existing fields and excludedFields array ?',
            ok: function(){
              this.fire("component-updated",Object.assign(this.component,{
                "fields":[],
                "excludeFields":[]
              }));
            }.bind(this),
            cancel:function(){
              this.fire("component-updated",this.component);
            }.bind(this)
          });
          break;
      case "component.excludeFields" :
          //Ignored as "component.fields" will be updated next from field-editor
          break;
      case "component.restUrl":
        //Ignored as "component.restUrl" does not need a render
        break;
      default :
        this.fire("component-updated",this.component);
    }
  }
}

window.customElements.define(OeComponentEditor.is, OeComponentEditor);