var model;
var modelIsReady = false;

var ViewportModel = {
  createModel: function () {
    if (modelIsReady === false) {
      model = document.createElement('DIV');

      model.style.position = 'fixed';
      model.style.left = '0px';
      model.style.top = '0px';
      model.style.zIndex = '-9999px';

      model.style.width = '100vw';
      model.style.maxWidth = '100%';
      model.style.height = '100vh';
      model.style.maxHeight = '100%';

      model.style.boxSizing = 'border-box';
      model.style.padding = '0';
      model.style.margin = '0';

      model.style.visibility = 'hidden';

      document.body.appendChild(model);
      modelIsReady = true;
    }
  },
  width: function () {
    this.createModel();
    return model.offsetWidth;
  },
  height: function () {
    this.createModel();
    return model.offsetHeight;
  },
};

export default ViewportModel;