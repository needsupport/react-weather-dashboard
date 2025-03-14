import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { MessageSquare, ChevronDown, ChevronUp, AlertCircle, Loader } from 'lucide-react';
import { fetchNWSForecastDiscussion } from './weatherDataUtils';

/**
 * ForecastDiscussion - Displays the NWS weather forecast discussion
 * 
 * @component
 * @param {Object} props
 * @param {string} props.office - NWS office code
 * @returns {JSX.Element}
 */
const ForecastDiscussion = ({ office }) => {
  const [discussion, setDiscussion] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only fetch if the component is expanded and we have an office code
    if (isExpanded && office && !discussion) {
      fetchDiscussionData();
    }
  }, [isExpanded, office]);

  const fetchDiscussionData = async () => {
    if (!office) {
      setError('No weather office available');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchNWSForecastDiscussion(office);
      setDiscussion(data);
    } catch (error) {
      console.error('Failed to fetch forecast discussion:', error);
      setError('Unable to load forecast discussion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  // Format discussion text with paragraph breaks
  const formatDiscussionText = (text) => {
    if (!text) return null;
    
    // Split by lines that start with $$ or .SECTION_NAME...
    const sections = text.split(/\n(?=\.[\w\s]+\.{2,}|\$\$)/g);
    
    return sections.map((section, index) => {
      // Skip empty sections
      if (!section.trim()) return null;
      
      // Format section headers
      let formattedSection = section;
      const headerMatch = section.match(/^\.([^.]+)\.{2,}/);
      
      if (headerMatch) {
        const header = headerMatch[1].trim();
        const content = section.slice(headerMatch[0].length).trim();
        
        return (
          <div key={`section-${index}`} className="mb-4">
            <h4 className="font-bold text-gray-800 mb-1">{header}</h4>
            <p className="whitespace-pre-line">{content}</p>
          </div>
        );
      }
      
      // Handle $$ dividers
      if (section.startsWith('$$')) {
        return <hr key={`divider-${index}`} className="my-3 border-gray-300" />;
      }
      
      // Regular paragraph
      return <p key={`para-${index}`} className="mb-3 whitespace-pre-line">{section}</p>;
    });
  };

  const formatIssuanceTime = (time) => {
    if (!time) return '';
    
    try {
      const date = new Date(time);
      return date.toLocaleString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return time;
    }
  };

  return (
    <div className="mt-6 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <button
        onClick={handleToggle}
        className="w-full px-4 py-3 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center">
          <MessageSquare size={18} className="text-blue-600 mr-2" />
          <span className="font-medium">Forecast Discussion</span>
          {discussion && (
            <span className="ml-2 text-sm text-gray-500">
              • {formatIssuanceTime(discussion.issuanceTime)}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp size={18} className="text-gray-500" />
        ) : (
          <ChevronDown size={18} className="text-gray-500" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 py-3">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader size={24} className="animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600">Loading discussion...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-6 text-red-500">
              <AlertCircle size={18} className="mr-2" />
              <span>{error}</span>
            </div>
          ) : discussion ? (
            <div className="text-sm text-gray-700 leading-relaxed">
              <div className="font-semibold text-lg mb-2">{discussion.productName}</div>
              <div className="p-4 bg-gray-50 rounded-lg overflow-auto max-h-96">
                {formatDiscussionText(discussion.text)}
              </div>
              <div className="mt-3 text-xs text-gray-500">
                Source: National Weather Service
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              No discussion available
            </div>
          )}
        </div>
      )}
    </div>
  );
};

ForecastDiscussion.propTypes = {
  office: PropTypes.string
};

export default ForecastDiscussion;
