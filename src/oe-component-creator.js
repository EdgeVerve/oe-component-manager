/**
 * @license
 * ©2018-2019 EdgeVerve Systems Limited (a fully owned Infosys subsidiary),
 * Bangalore, India. All Rights Reserved.
 */
import { html, PolymerElement } from "@polymer/polymer/polymer-element.js";
import "@polymer/iron-flex-layout/iron-flex-layout-classes.js";
import { OEAjaxMixin } from "oe-mixins/oe-ajax-mixin.js";
import "@polymer/iron-pages/iron-pages.js";
import "@polymer/iron-selector/iron-selector.js";
import "@polymer/paper-checkbox/paper-checkbox.js";
import "oe-ui-forms/validators/oe-async-validator.js";
import "oe-input/oe-input.js";
import "oe-combo/oe-combo.js";
import "@polymer/paper-radio-group/paper-radio-group.js";
import "@polymer/paper-radio-button/paper-radio-button.js";
import "@polymer/iron-selector/iron-selector.js";
import "@polymer/paper-tooltip/paper-tooltip.js";

/**
 * `oe-component-creator`
 *  A template element , used to create oe-ui Polymer 3 elements.
 *  By default includes `OECommonMixin` to support use of 'fire','async' and '_deepValue' functions.
 * 
 *
 * @customElement
 * @polymer
 * @appliesMixin OEAjaxMixin
 */
class OeComponentCreator extends OEAjaxMixin(PolymerElement) {
  static get is() {
    return 'oe-component-creator';
  }

  static get template() {
    return html`
    <style include="iron-flex iron-flex-alignment">
    :host {
      display: block;
      position: relative;
      height: 500px;
      width: 500px;
  }

  .step-container {
      height: calc(100% - 40px);
  }
  #step-selector,.creation-container{
    height:100%;
  }
  .prop {
      font-size: 12px;
      padding: 4px 8px;
      margin: 6px 0px;
      background: var(--dark-primary-color);
      border-radius: 4px;
      max-width: 200px;
  }

  paper-checkbox {
      --paper-checkbox-unchecked-color: rgba(255, 255, 255, 0.6);
      --paper-checkbox-checked-color: #ffffff;
      --paper-checkbox-checkmark-color: #000000;
      --paper-checkbox-label-color: #ffffff;
      --paper-checkbox-label: {
          max-width: 150px;
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
      }
  }

  .template-desc {
      font-size: 12px;
      font-family: 'Roboto-Light';
      padding: 6px 0px;
  }


    .step {
      height: 100%;
  }

  .step-content {
      height: calc(100% - 56px);
      overflow: auto;
      padding: 0px 16px;
  }

  .step-title,.list-header {
      height: 40px;
      line-height: 40px;
      font-size: 16px;
      padding: 8px 16px;
  }

  paper-radio-button {
      display: block;
      padding: 8px 0px;
      --paper-radio-button-unchecked-color: rgba(255, 255, 255, 0.6);
      --paper-radio-button-checked-color: rgba(255, 255, 255, 0.6);
      --paper-radio-button-label-color: rgba(255, 255, 255, 0.6);
  }

  oe-input {
      --paper-input-container-focus-color: #ffffff;
      --paper-input-container-input-color: rgba(255, 255, 255, 0.6);
      --paper-input-container-color: rgba(255, 255, 255, 0.6);
  }

  oe-combo {
      --paper-input-container-focus-color: #ffffff;
      --paper-input-container-input-color: rgba(255, 255, 255, 0.6);
      --paper-input-container-color: rgba(255, 255, 255, 0.6);
  }

  .main-layout{
    height: calc(100% - 40px);
  }

  .main-layout > div{
    height:100%;
  }

  .more-props {
      padding: 12px 0px;
  }

  .prop-list {
      padding: 8px 0px;
      border-top: 2px solid var(--dark-primary-color);
  }



    .helper-text {
        font-size: 12px;
        font-style: italic;
        opacity: 0.54;
        margin-top: 8px;
    }


    #step-selector {
        width: 200px;
        background: var(--light-primary-color);
    }

    .list-item {
      height: 40px;
      padding: 8px 16px;
      box-sizing: border-box;
    }

    .list-item::before {
        content: ' ';
        width: 12px;
        height: 12px;
        margin-right: 10px;
        border-radius: 50%;
        flex-shrink: 0;
        background: var(--default-text-color);
        display: inline-block;
        position: relative;
    }

    .list-item.active::before {
        background: var(--accent-color);
    }

    .list-item.invalid::before {
        background: var(--error-color);
    }

    .navigation-section{
      background: var(--dark-primary-color);
      height:40px;
    }

    .template-no-model paper-radio-button[type="form"]{
        display: none;
    }
    </style>
    <div class="layout horizontal creation-container">
    <div class="layout vertical flex">
    <iron-pages selected=[[selectedStep]] class="flex main-layout">
      <div id="name-model-section">
        <div class="step-title">Name the page and configure</div>
        <div class="step-content">
          <oe-input label="Page Name" value="{{uiComponent.name}}" field-id="name" required
          pattern="^([a-zA-Z0-9]+)((-[a-zA-Z0-9]+)+)$" id="componentName" user-error-message='{"patternMismatch":"Polymer name should contain a - hyphen"}'></oe-input>

          <oe-async-validator fields='["name"]' model={{uiComponent}}
          requesturl='[[_validateUrl(uiComponent.name)]]'
          ensure="absent" error="component name already in use"></oe-async-validator>

          <oe-combo id="modelName" show-refresh value="{{uiComponent.modelName}}"
          label="Search Models" displayproperty="name" valueproperty="name"
          listurl="[[_getRestApiUrl('/ModelDefinitions?filter[fields][name]=true')]]" on-pt-item-confirmed="_getModelData" on-blur="_getModelData"></oe-combo>
          <div hidden$="[[!isModelObtained]]">
              <div class="more-props">
                  <paper-checkbox checked="{{uiComponent.autoInjectFields}}">Auto Inject Fields</paper-checkbox>
                  <div class="helper-text">Properties updated in the model will be injected in the form automatically</div>
              </div>
              <div class="prop-list">
                  <template is="dom-repeat" items="[[modelMeta.modelProperties]]">
                      <div class="prop">
                          <paper-checkbox checked="{{item.applied}}" class="prop-item">[[item.name]]</paper-checkbox>
                      </div>
                  </template>
              </div>
          </div>
        </div>
      </div>
      <div id="template-selection-section">
        <div class="step-title">Choose template</div>
        <div class$="step-content template-[[_getTemplateType(uiComponent.modelName)]]">
            <paper-radio-group selected="{{uiComponent.templateName}}">
                <template is="dom-repeat" items="[[templateList]]">
                    <paper-radio-button name="{{item.file}}" type$="[[item.type]]">
                      <div class="layout vertical">
                        <label>[[item.file]]</label>
                        <paper-tooltip class="template-desc" position="top" hidden$="[[!item.description]]">[[item.description]]</paper-tooltip>
                      </div>
                    </paper-radio-button>
                </template>
            </paper-radio-group>
        </div>
      </div>
    </iron-pages>
    <div class="navigation-section layout horizontal center justified">
        <paper-button class="secondary-btn" on-tap="_showComponentsList">CANCEL</paper-button>
        <paper-button class="secondary-btn" hidden="[[hidePrevNavigation]]" on-tap="_showPrevStep">BACK</paper-button>
        <paper-button class="primary-btn" on-tap="_showNextStep">[[buttonTitle]]</paper-button>
    </div>
    </div>
    <div id="step-selector">
      <div class="list-header">Create new page</div>
      <iron-selector selected="{{selectedStep}}">
          <template is="dom-repeat" items="{{stepList}}" as="step">
              <div name$="[[index]]" class$="list-item [[_computeStepStatus(selectedStep,index)]]">{{step}}</div>
          </template>
      </iron-selector>
    </div>
    </div>
    `;
  }

  _computeStepStatus(curStep, index) {
    if (curStep === index) {
      return 'active';
    }

    if (index === 0) {
      this.$.componentName.validate();
      this.$.modelName.validate();
      return this.$.componentName.invalid || this.$.modelName.invalid ? 'invalid' : '';
    } else {
      return this.uiComponent.templateName ? '' : 'invalid';
    }
  }

  constructor() {
    super();
    this.stepList = ["Name & Model", "Template selection"];
    this._resetFields();
    this.makeAjaxCall("designer/templates", "GET", null, null, null, null, function (err, resp) {
      if (err) {
        this.fire("oe-show-error", "Error fetching templates");
        return;
      }
      resp.forEach(this._getDescription.bind(this));
      this.set("templateList", resp);
      this.fire("update-templatelist",resp);
    }.bind(this));
  }

  _getRestApiUrl(url) {
    return window.OEUtils._getRestApiUrl(url);
  }

  _validateUrl(name) {
    return window.OEUtils._getRestApiUrl('/UIComponents?filter={"where":{"name":"' + name + '"}}');
  }

  _getModelData() {
    var self = this;
    var model = this.uiComponent.modelName;
    var isValidModel = !this.$.modelName.invalid;

    if (isValidModel && model && model.length > 0) {
      if (model == this._currModel) {
        return;
      }
      this._currModel = model;
      this.makeAjaxCall(window.OEUtils._getRestApiUrl('/UIComponent/modelmeta/') + model, 'get', null, null, null, null, function (err, res) {
        self._currModel = null;
        if (err) {
          self.fire('oe-show-error', 'Error in Fetching Model Meta');
          return;
        }
        self.generateFieldsArr(res);
        self.set('isModelObtained', true);
      });
    } else {
      self.set('isModelObtained', false);
      self.set('modelMeta.modelProperties', []);
    }
  }

  generateFieldsArr(resp) {
    var properties = [];
    var meta = {};
    var modelData = resp[this.uiComponent.modelName];
    modelData.properties && Object.keys(modelData.properties).forEach(function (prop) {
      var modelprop = {
        name: prop,
        'config': modelData.properties[prop],
        'applied': true
      };

      if (prop[0] == '_' || prop == 'id' || prop == 'scope') {
        return;
      } else {
        properties.push(modelprop);
      }
    });
    meta.modelProperties = properties;
    meta.modelName = this.uiComponent.modelName;
    meta.autoInjectFields = true;
    this.set('modelMeta', meta);
  }

  static get observers() {
    return ['stepChanged(selectedStep)'];
  }

  _showComponentsList() {
    this.fire("show-component-list");
  }

  stepChanged(step) {
    if (step === 1) {
      this.set('buttonTitle', 'SAVE');
    } else {
      this.set('buttonTitle', 'NEXT');
    }
    this.set('hidePrevNavigation', step === 0);
  }
  _showNextStep() {
    if (this.selectedStep === 0) {
      this.selectedStep++;
    } else {
      var isValid = !(this.$.componentName.invalid || this.$.modelName.invalid);
      if (isValid) {
        this.createPage();
      } else {
        this.fire('oe-show-error', "Please fill all the fields");
      }
    }
  }
  createPage() {
    var self = this;
    var apiurl = window.OEUtils._getRestApiUrl('/UIComponents');
    var payload = this.uiComponent;
    if (payload.modelName) {
      if (payload.autoInjectFields) {
        payload.excludeFields = this.modelMeta.modelProperties.filter(function (p) {
          return !p.applied;
        }).map(function (prop) {
          return prop.name;
        });
      } else {
        payload.fields = this.modelMeta.modelProperties.filter(function (p) {
          return p.applied;
        }).map(function (prop) {
          return {
            fieldId: prop.name
          };
        });
      }
    }
    this.makeAjaxCall(apiurl, 'post', payload, null, null, function (err, res) {
      if (!err) {
        self.fire('component-created', res);
        self.fire('oe-show-success', 'Component successfully created');
      } else {
        self.resolveError(err);
      }
    });
  }
  _resetFields() {
    this.set('isModelObtained', false);
    this.set('uiComponent', {
      name: "",
      templateName: "default-form.html",
      fields: [],
      excludeFields: [],
      autoInjectFields: false
    });
    this.set('selectedStep', 0);
    this.set('lastVisitedTabIndex', 0);
    this.set('buttonTitle', 'NEXT');
  }
  _showPrevStep() {
    if (this.selectedStep > 0) {
      this.selectedStep--;
    }
  }
  _getDescription(template) {
    var descKey = "@description";
    var lines = template.content.split('\n');
    var descLine = lines.find(function (line) {
      return !!line.match(descKey);
    });
    if (descLine) {
      template.description = descLine.trim().substring(descLine.lastIndexOf(descKey) + descKey.length, descLine.length).trim();
    } else {
      template.description = "";
    }
  }
  _getTemplateType(modelName) {
    return (modelName && modelName.length) ? "has-model" : "no-model";
  }
}

window.customElements.define(OeComponentCreator.is, OeComponentCreator);