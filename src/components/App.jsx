/* eslint-disable react/destructuring-assignment */
import React from 'react';
import Header from './core/Header';
import SearchResults from './search/SearchResults';
import '../styles/main.scss';
import '../styles/react-toggle.scss';
import Button from './core/Button';
import KeywordsInput from './search/KeywordsInput';
import Labels from './toggles/Labels';
import Languages from './toggles/Languages';
import { formatLabelsForUrl, formatTextToSearch } from '../utils/formatting';
import PulseLoader from 'react-spinners/PulseLoader';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      labels: {
        goodFirstIssue: false,
        helpWanted: false,
        easy: false,
        documentation: false,
        bug: false,
        enhancement: false,
      },
      languages: {
        python: false,
        javascript: false,
        php: false,
        java: false,
        ruby: false,
        swift: false,
      },
      textToSearch: '',
      results: {},
      url: '',
      isFetching: false,
    };
  }

  createUrl = () => {
    const { labels, languages, textToSearch } = this.state;
    const baseUrl = 'https://api.github.com/search/issues?q=';
    const sortOptions = '+state:open&sort=created&order=desc&per_page=20';
    const formattedText = formatTextToSearch(textToSearch);

    const activeLabels = Object.keys(labels).filter(item => labels[item]);
    const formattedLabels = formatLabelsForUrl(activeLabels);
    const joinedLabels = formattedLabels.map(label => `+label:${label}`).join('');

    const activeLanguage = Object.keys(languages).filter(item => languages[item]);
    const formattedLanguage = activeLanguage.map(language => `+language:${language}`).join('');

    return `${baseUrl}
      ${textToSearch && formattedText}type:issue${joinedLabels}${formattedLanguage}${sortOptions}`;
  };

  getIssues = async event => {
    event.preventDefault();
    this.setState({ isFetching: true });
    const finalUrl = this.createUrl();
    const response = await fetch(finalUrl);
    const json = await response.json();
    this.setState({ isFetching: false, results: json, url: finalUrl }, () =>
      console.log('results', this.state.results)
    );
  };

  handleTextChange = event => {
    this.setState({ textToSearch: event.target.value });
  };

  toggleLanguage = selectedName => {
    const currentLanguages = this.state.languages;
    Object.keys(currentLanguages).forEach(key => {
      if (key === selectedName) {
        currentLanguages[key] = !currentLanguages[key];
      } else {
        currentLanguages[key] = false;
      }
    });
    return currentLanguages;
  };

  handleToggleChange = event => {
    const { labels } = this.state;
    const selectedType = event.target.dataset.type;
    const selectedName = event.target.name;

    if (selectedType === 'label') {
      this.setState({
        labels: { ...labels, [selectedName]: !labels[selectedName] },
      });
    } else if (selectedType === 'language') {
      const updatedLanguages = this.toggleLanguage(selectedName);
      this.setState({
        languages: { ...updatedLanguages },
      });
    }
  };

  resetToggles = toggleType => {
    const currentItems = this.state[toggleType];
    Object.keys(currentItems).forEach(key => {
      currentItems[key] = false;
    });
    return currentItems;
  };

  onResetToggles = () => {
    const resetLabels = this.resetToggles('labels');
    const resetLanguages = this.resetToggles('languages');
    this.setState({
      labels: { ...resetLabels },
      languages: { ...resetLanguages },
    });
  };

  render() {
    const { isFetching, labels, languages, results, textToSearch, url } = this.state;

    return (
      <div className="wrapper">
        <Header />
        <Labels labels={labels} handleToggleChange={this.handleToggleChange} />
        <Languages languages={languages} handleToggleChange={this.handleToggleChange} />
        <KeywordsInput handleTextChange={this.handleTextChange} textToSearch={textToSearch} />

        {/* Reset button */}

        <Button
          className="reset-btn"
          classNameWrapper="reset-btn-wrapper"
          onClick={this.onResetToggles}
          type="button"
        >
          Reset
        </Button>

        {/* Get button */}
        <Button
          className="get-issues-btn"
          classNameWrapper="get-button-wrapper"
          forForm="issues-form"
          onClick={this.getIssues}
          type="submit"
        >
          Load
        </Button>

        {/* url for testing */}
        {/* {results.items && url} */}

        {isFetching ? (
          <div className="loading-spinner">
            <PulseLoader color="black" />
          </div>
        ) : (
          results.items && <SearchResults results={results} />
        )}
      </div>
    );
  }
}

export default App;
