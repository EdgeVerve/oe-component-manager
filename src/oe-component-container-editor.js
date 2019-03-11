/**
 * @license
 * ©2018-2019 EdgeVerve Systems Limited (a fully owned Infosys subsidiary),
 * Bangalore, India. All Rights Reserved.
 */
import { html, PolymerElement } from "@polymer/polymer/polymer-element.js";
import "@polymer/iron-flex-layout/iron-flex-layout-classes.js";
import { OECommonMixin } from "oe-mixins/oe-common-mixin.js";
import "oe-input/oe-input.js";
import "oe-input/oe-json-input.js";
import "@polymer/iron-icon/iron-icon.js";
import "@polymer/iron-icons/iron-icons.js";
import "oe-data-table/oe-data-table.js";

/**
 * `oe-component-container-editor`
 *  A template element , used to create oe-ui Polymer 3 elements.
 *  By default includes `OECommonMixin` to support use of 'fire','async' and '_deepValue' functions.
 * 
 *
 * @customElement
 * @polymer
 * @appliesMixin OECommonMixin
 * @demo demo/index.html
 */
class OeComponentContainerEditor extends OECommonMixin(PolymerElement) {

  static get is() { return 'oe-component-container-editor'; }

  static get template() {
    return html`
    <style include="iron-flex iron-flex-alignment">
    .section-heading{
        padding: 0px 16px;
        font-size:16px;
        height:36px;
        box-shadow: 0px 2px 1px 1px rgba(0, 0, 0, 0.2);
        background: var(--light-primary-color);
      }

      iron-icon{
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

      oe-input,oe-json-input{
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
      oe-data-table{
        --oe-data-table-header:{
          background: var(--light-primary-color);
          height:36px;
          color:#FFF;
          padding: 0px 16px;
          font-size:16px;
          box-shadow: 0px 2px 1px 1px rgba(0, 0, 0, 0.2);
        }
        
      }
    </style>
    <div>
        <div class="section-heading horz-center">
            <label>Default container settings</label>
        </div>
        <div class="section-detail layout horizontal start justified">
          <div class="flex">
            <oe-input label="Target Selector" value="{{container.target}}" required></oe-input>
            <oe-input label="Node Type" value="{{container.nodeType}}"></oe-input>
          </div>
          <oe-json-input max-row="5" class="flex" label="Node attributes" value="{{container.nodeAttributes}}"></oe-json-input>  
        </div>
        <oe-data-table label="Container" page-size="4"
          items="{{_containerSteps}}" columns="[[_stepColumn]]"
          row-actions="[[_stepRowActions]]" toolbar-actions="[[_stepToolbarActions]]" 
          empty-state-message="No Containers found"
          disable-selection disable-add disable-delete disable-config-editor>
        </oe-data-table>
    </div>
    `;
  }

  static get properties() {
    return {
      container: {
        type: Object,
        notify: true,
        value:function(){
          return {};
        },
        observer: '_containerChanged'
      }
    };
  }

  constructor() {
    super();
    this._stepColumn = [{
      key: "id",
      label: "Step Id",
      type:"string",
      disableSort:true,
      disableFilter:true
    }, {
      key: "target",
      label: "Target Selector",
      type:"string",
      disableSort:true,
      disableFilter:true
    }, {
      key: "nodeAttributes",
      label: "Node Attributes",
      type:"object",
      disableSort:true,
      disableFilter:true
    }, {
      key: "nodeType",
      label: "Node Type",
      type:"string",
      disableSort:true,
      disableFilter:true
    }];

    this._stepToolbarActions=[{
      "icon":"add",
      "title":"Add new step",
      "action":"add-step"
    }];

    this._stepRowActions = [{
      "icon":"delete",
      "title":"Delete step",
      "action":"delete-step"
    },{
      "icon":"arrow-upward",
      "title":"Move Up",
      "action":"move-up"
    },{
      "icon":"arrow-downward",
      "title":"Move down",
      "action":"move-down"
    }];


    this.addEventListener("oe-data-table-action-add-step",this._addStepContainer.bind(this));
    this.addEventListener("oe-data-table-row-action",this._handleRowEvent.bind(this));
  }

  _containerChanged(newVal, oldVal) {
    if (newVal && oldVal != newVal) {
      this._setComponentContainers(); 
    }
  }

  _setComponentContainers(){
    this.set("_containerSteps", Array.isArray(this.container.steps) ? this.container.steps.slice() : []);
  }
  _handleRowEvent(event){
    var action = event.detail.action.action;
    var rowIdx = event.detail.rowIndex;
    var array = this._containerSteps;
    var row;
    switch(action){
      case "delete-step":
        array.splice(rowIdx,1);
        break;
      case "move-up":
        if(rowIdx !== 0){
          row = array.splice(rowIdx, 1)[0];
          array.splice(rowIdx - 1, 0, row);
        }
      break;
      case "move-down":
        if(rowIdx !== (array.length-1)){
          row = array.splice(rowIdx, 1)[0];
          array.splice(rowIdx + 1, 0, row);
        }
      break;
      default:return;
    }
    this.set("_containerSteps",array.slice());
  }

  _addStepContainer() {
    if (!Array.isArray(this._containerSteps)) {
      this._containerSteps = [];
    }
    this.push('_containerSteps', {
      "id": "step-" + (this._containerSteps.length + 1)
    });
  }

  _validString(str){
    return (typeof str === "string" && str.length > 0);
  }

  _validObject(obj){
    if(typeof obj !== "object" || obj === null){
      return false;
    }
    return (Object.keys(obj).length > 0);
  }

  _getContainer(){
    var valid = true;
    var errorMsg;
    var self = this;

    
    this._containerSteps.forEach(function(step,idx){
      if(!step.id || step.id.trim().length === 0){
        valid = false;
        errorMsg = "Id is mandatory for containers: container "+(idx+1);
      }
    });


    if(valid){
      this.container.steps = this._containerSteps.map(function(step){
        var stepObj = {
          "id":step.id
        };

        if(self._validString(step.target)){
          stepObj.target = step.target;
        }

        if(self._validString(step.nodeType)){
          stepObj.nodeType = step.nodeType;
        }

        if(self._validObject(step.nodeAttributes)){
          stepObj.nodeAttributes = step.nodeAttributes;
        }

        return stepObj;
      });
    }




    return {
      "valid":valid,
      "error":errorMsg,
      "result":this.container
    };
  }
}

window.customElements.define(OeComponentContainerEditor.is, OeComponentContainerEditor);