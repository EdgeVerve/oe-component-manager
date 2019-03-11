/**
 * @license
 * ©2018-2019 EdgeVerve Systems Limited (a fully owned Infosys subsidiary),
 * Bangalore, India. All Rights Reserved.
 */

 import { html, PolymerElement } from "@polymer/polymer/polymer-element.js";
 import "@polymer/iron-flex-layout/iron-flex-layout-classes.js";
 import { OECommonMixin } from "oe-mixins/oe-common-mixin.js";
import "oe-input/oe-json-input.js";
import "oe-input/oe-input.js";
import "oe-combo/oe-combo.js";
import "@polymer/paper-button/paper-button.js";
import "@polymer/iron-pages/iron-pages.js";
 
 /**
  * `oe-component-field-form`
  *  A template element , used to create oe-ui Polymer 3 elements.
  *  By default includes `OECommonMixin` to support use of 'fire','async' and '_deepValue' functions.
  * 
  *
  * @customElement
  * @polymer
  * @appliesMixin OECommonMixin
  * @demo demo/index.html
  */

class OeComponentFieldForm extends OECommonMixin(PolymerElement) {
  static get is() {
    return 'oe-component-field-form';
  }

  static get template() {
    return html`
     <style include="iron-flex iron-flex-alignment">
      .title-panel{
        padding:4px 16px;
        background:var(--light-primary-color);
        color:#FFF;
      }
      .content-panel{
        background : #FFF;
        padding: 16px;
        max-height: 300px;
        overflow:auto;
      }
      #form-view oe-input,oe-combo {
        width : calc(50% - 16px);
        padding: 0px 8px;
      }
      fieldset{
        margin-bottom : 12px;
      }
      .helper-text{
        font-size : 14px;
        display : block;
      }
     </style>
     <div>
      <div class="title-panel layout horizontal justified center">
        <label> Edit Field </label>
        <div class="action-panel layout horizontal justified center">
          <paper-button id="saveFieldBtn" class="primary" on-tap="_saveFieldChanges"> Save </paper-button>
          <paper-button on-tap="_cancelFieldChanges"> Cancel </paper-button>
          <paper-button on-tap="_toggleView"> Toggle View </paper-button>
        </div>
      </div>
      <div class="content-panel">
        <iron-pages selected=[[_selectedView]]>
          <div id="form-view">
            <fieldset>
              <legend>Primary fields</legend>
              <div class="layout horizontal justified wrap">
                <oe-input id="fieldIdHolder" label="Field Id" value={{field.fieldId}} required></oe-input>
                <oe-input label="Label" value={{field.label}} required></oe-input>
                <oe-input label="UI Type" value={{field.uitype}} required></oe-input>
                <oe-input label="CSS Class" value={{field.class}} required></oe-input>
              </div>
            </fieldset>
            <fieldset class="layout horizontal justified wrap">
              <legend>Boolean fields can accept true/false or binding string</legend>
              <div class="layout horizontal justified wrap">
                <oe-combo label="Required" allow-free-text displayproperty="d" valueproperty="v" listdata=[[_booleanList]] value={{field.required}}></oe-combo>
                <oe-combo label="Disabled" allow-free-text displayproperty="d" valueproperty="v" listdata=[[_booleanList]] value={{field.disabled}}></oe-combo>
                <oe-combo label="Hidden" allow-free-text displayproperty="d" valueproperty="v" listdata=[[_booleanList]] value={{field.hidden}}></oe-combo>
              </div>
            </fieldset>
            <label class="helper-text"> To add additional settings to this field use toggle view.</label>
          </div>
          <div id="json-view">
            <oe-json-input id="fieldHolder" required label="Field Object" value={{field}}></oe-json-input>
          </div>
        </iron-pages>
      </div>
     </div>
     `;
  }

  static get properties() {
    return {};
  }

  constructor() {
    super();
    this.modelAlias = "field";
    this._selectedView = 0;
    this._booleanList = [
      {
        d:"true",v:true
      },
      {
        d:"false",v:false
      }
    ];
  }

  _toggleView(){
    if(this._selectedView === 0){
      this.set("_selectedView",1);
    }else{
      this.set("_selectedView",0);
    }
  }

  _saveFieldChanges(){   
    if(this._selectedView === 0){
      this.$.fieldIdHolder.validate();
      if(!this.$.fieldIdHolder.invalid){
        this.fire("oe-action-update",this.field);
        return;
      }
    }else{
      this.$.fieldHolder.validate();
      if(!this.$.fieldHolder.invalid && this.field){
        if(typeof this.field.fieldId === "string" && this.field.fieldId.length > 0){
          this.fire("oe-action-update",this.field);
        }
      }
    }
    this.fire("oe-show-error","FieldId is mandatory");    
  }

  _cancelFieldChanges(){
    this.fire("show-grid-view");
  }

}
 window.customElements.define(OeComponentFieldForm.is, OeComponentFieldForm);

 export default OeComponentFieldForm;