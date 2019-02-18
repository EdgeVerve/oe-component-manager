/**
 * @license
 * �2018-2019 EdgeVerve Systems Limited (a fully owned Infosys subsidiary),
 * Bangalore, India. All Rights Reserved.
 */
import { html, PolymerElement } from "@polymer/polymer/polymer-element.js";
import "@polymer/iron-flex-layout/iron-flex-layout-classes.js";
import { OECommonMixin } from "oe-mixins/oe-common-mixin.js";
import "oe-input/oe-input.js";
import "oe-input/oe-json-input.js";
import "@polymer/iron-icon/iron-icon.js";
import "@polymer/iron-icons/iron-icons.js";
import "@polymer/paper-tooltip/paper-tooltip.js";
import "oe-data-table/oe-data-table.js";
import "./oe-component-field-form.js";

/**
 * `oe-component-field-editor`
 *  A template element , used to create oe-ui Polymer 3 elements.
 *  By default includes `OECommonMixin` to support use of 'fire','async' and '_deepValue' functions.
 * 
 *
 * @customElement
 * @polymer
 * @appliesMixin OECommonMixin
 * @demo demo/index.html
 */
class OeComponentFieldEditor extends OECommonMixin(PolymerElement) {

  static get is() { return 'oe-component-field-editor'; }

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
        --iron-icon-width:20px;
        --iron-icon-height:20px;
        cursor:pointer;
      }

      .section-detail{
        padding: 8px 16px;
        height: 200px;
        overflow: auto;
      }

      .horz-center{
        @apply --layout-horizontal;
        @apply --layout-center;
        @apply --layout-justified;
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
        --oe-data-table-header-title:{
          color:#FFF;
        }
      }

      .model-fields-list{
        box-shadow:-1px 0px 0px 0px rgba(0,0,0,0.2);
      }

      .options iron-icon{
        margin-left:8px;
      }

      .field-item{
        padding-bottom: 8px;
      }
    </style>
    <div class="layout vertical">
      <oe-data-table id="fieldTable" label="Fields" page-size="4" class="flex"
          items="{{_fields}}" columns="[[_fieldColumn]]"
          row-actions="[[_fieldRowActions]]" toolbar-actions="[[_fieldToolbarActions]]" 
          empty-state-message="No Fields found"
          disable-selection disable-add disable-delete disable-config-editor>
      </oe-data-table>
      <div class="layout horizontal start justified flex">
        <div class="component-section flex">
          <div class="section-heading horz-center">
            <label>Excluded fields </label>
            <div>
              <iron-icon icon="help-outline"></iron-icon>
              <paper-tooltip position="left">
                <label class="tooltip-helper-text">Fields in excluded list will not be added into the component </label>
              </paper-tooltip>
            </div>
          </div>
          <div class="section-detail excluded-field-list">
            <dom-repeat items=[[_excludedFields]]>
              <template>
                <div class="field-item layout horizontal justified center">
                  <label>[[item]]</label>
                  <div class="options">
                    <iron-icon icon="clear" on-tap="_removeFromExclude"></iron-icon>
                    <paper-tooltip position="left">
                      <label class="tooltip-helper-text"> Remove field from Excluded list. </label>
                    </paper-tooltip>
                  </div>
                </div>
              </template>
            </dom-repeat>
          </div>
        </div>
        <div class="component-section flex">
          <div class="section-heading horz-center">
            <label>Model fields </label>
            <div>
              <iron-icon icon="help-outline"></iron-icon>
              <paper-tooltip position="left">
                <label class="tooltip-helper-text"> Fields in this list will be added if "autoInjectFields" flag is true. </label>
              </paper-tooltip>
            </div>
          </div>
          <div class="section-detail model-fields-list">
            <dom-repeat items=[[_modelFields]]>
              <template>
                <div class="field-item layout horizontal justified center">
                  <label>[[item]]</label>
                  <div class="options layout horizontal center">
                    <div>
                      <iron-icon icon="delete" on-tap="_addToExclude"></iron-icon>
                      <paper-tooltip position="left">
                          <label class="tooltip-helper-text">Move field to Excluded list.</label>
                      </paper-tooltip>
                    </div>
                    <div>
                      <iron-icon icon="add" on-tap="_addToField"></iron-icon>
                      <paper-tooltip position="left">
                       <label class="tooltip-helper-text"> Add field to Fields list. </label>
                      </paper-tooltip>
                    </div>
                  </div>
                </div>
              </template>
            </dom-repeat>
          </div>
        </div>
      </div>
    </div>
    `;
  }

  static get properties() {
    return {
      metaData: {
        type: Object,
        observer: '_metaDataChanged'
      },
      component: {
        type: Object,
        notify:false,
        value: function () {
          return {};
        }
      },
      containers: {
        type: Array,
        value: function () {
          return [];
        },
        observer: "_containersChanged"
      }
    };
  }

  constructor() {
    super();
    this._fieldToolbarActions = [{
      "icon": "add",
      "title": "Add new field",
      "action": "add-field"
    }];
    this._fieldRowActions = [{
      "icon": "create",
      "title": "Edit field",
      "action": "edit-field",
      "formUrl": "/node_modules/oe-component-manager/src/oe-component-field-form.js"
    }, {
      "icon": "clear",
      "title": "Remove field entry",
      "action": "delete-field"
    }, {
      "icon": "arrow-upward",
      "title": "Move Up",
      "action": "move-up"
    }, {
      "icon": "arrow-downward",
      "title": "Move down",
      "action": "move-down"
    }];
    this.addEventListener("oe-data-table-action-add-field", this._addNewField.bind(this));
    this.addEventListener("oe-data-table-row-action", this._handleRowEvent.bind(this));
  }

  _metaDataChanged(newVal, oldVal) {
    if (newVal && newVal !== oldVal) {
      this._setComponentFields();
    }
  }

  _setComponentFields(){
    var metaData = this.metaData || {};
    var fields = [];

    if (Array.isArray(metaData.fields)) {
      metaData.fields.forEach(function (field) {
        if (typeof field === "string") {
          fields.push({
            "fieldId": field
          });
        } else {
          fields.push(JSON.parse(JSON.stringify(field)));
        }
      });
    }

    this.set('_fields', fields);
    this._excludedFields = metaData.excludeFields || [];
    this.__computeModelFields();
  }

  __computeModelFields(){
    var metaData = this.metaData || {};
    var modelFields = [];
    this._modelName = metaData.modelName;

    if (!this._modelName) {
      modelFields = [];
    } else {
      var modelObj = metaData.metadata.models[this._modelName];
      modelFields = Object.keys(modelObj.properties).filter(function (prop) {
        var fieldArrIndex = this._fields.findIndex(function(f){
          return f.fieldId === prop;
        });
        var excludeArrIndex = this._excludedFields.indexOf(prop);
        return (fieldArrIndex === -1)&&(excludeArrIndex === -1);
      }.bind(this));
    }
    this.set('_modelFields', modelFields);
  }

  _containersChanged(newVal, oldVal) {
    if (newVal && newVal !== oldVal) {
      this._fieldColumn = [{
        key: "fieldId",
        label: "Field Id",
        type: "string",
        disableSort: true,
        disableFilter: true
      }, {
        key: "container",
        label: "Target Selector",
        type: "string",
        uiType: "oe-combo",
        editorAttributes: {
          "listdata": this.containers
        },
        disableSort: true,
        disableFilter: true
      }, {
        key: "label",
        label: "Label",
        type: "string",
        disableSort: true,
        disableFilter: true
      }, {
        key: "uitype",
        label: "UI Type",
        type: "string",
        disableSort: true,
        disableFilter: true
      }];
    }
  }

  _addNewField() {
    this.push("_fields",{
      "fieldId": "field"+this._fields.length
    });
  }

  _handleRowEvent(event) {
    var action = event.detail.action.action;
    var rowIdx = event.detail.rowIndex;
    var array = this._fields;
    var row;

    switch (action) {
      case "delete-field":
        array.splice(rowIdx, 1);
        this.__computeModelFields();
        break;

      case "move-up":
        if (rowIdx !== 0) {
          row = array.splice(rowIdx, 1)[0];
          array.splice(rowIdx - 1, 0, row);
        }

        break;

      case "move-down":
        if (rowIdx !== array.length - 1) {
          row = array.splice(rowIdx, 1)[0];
          array.splice(rowIdx + 1, 0, row);
        }
        break;
      default:
        return;
    }

    this.set("_fields", array.slice());
  }

  _addToExclude(event){
    var field = event.model.item;
    var index = event.model.index;
    this.splice("_modelFields",index,1);
    this.push("_excludedFields",field);
  }

  _addToField(event){
    var field = event.model.item;
    var index = event.model.index;
    this.splice("_modelFields",index,1);
    this.push("_fields",{
      "fieldId":field
    });
  }

  _removeFromExclude(event){
    var index = event.model.index;
    this.splice("_excludedFields",index,1);
    this.__computeModelFields();
  }

  _getField(){
    var component={
      fields:this._fields,
      excludeFields : this._excludedFields
    };
    return {
      valid:true,
      result:component
    };
  }
  _configField(fieldName) {
    var fieldObj = this.$.fieldTable.items.find(function (item) {
      return item.fieldId === fieldName;
    });
    this.$.fieldTable.fire("oe-data-table-row-form-load", {
      "url": "/node_modules/oe-component-manager/src/oe-component-field-form.js",
      "model": fieldObj
    });
  }
}

window.customElements.define(OeComponentFieldEditor.is, OeComponentFieldEditor);