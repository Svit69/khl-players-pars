import ApiClient from './apiClient.js';
import ResultView from './resultView.js';
import ParsingFormController from './parsingFormController.js';
import StatsTableRenderer from './statsTableRenderer.js';

document.addEventListener('DOMContentLoaded', () => {
  const formElement = document.getElementById('parser-form');
  const resultElement = document.getElementById('result');
  const apiClient = new ApiClient();
  const statsRenderer = new StatsTableRenderer();
  const resultView = new ResultView(resultElement, statsRenderer);

  new ParsingFormController(formElement, resultView, apiClient);
});
