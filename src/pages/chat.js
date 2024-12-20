import "../styles/chat.css";
import { Plus } from 'iconoir-react';
import { useState, useEffect, useRef } from "react";
import Select from 'react-select';

function Chat() {
  const [owners, setOwners] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [showApiInput, setShowApiInput] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('apiKey') || '';
  });

  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [iterations, setIterations] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const fullText = '✨ Zuki Playground';
  const typingSpeed = 150;
  const deletingSpeed = 100;
  const delayBeforeDelete = 3000;
  const delayBeforeRestart = 1500;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Typing animation effect
  useEffect(() => {
    let timeout;

    if (iterations >= 2) {
      setIsDone(true);
      setDisplayText(fullText);
      return;
    }

    if (!isDeleting && displayText === fullText) {
      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, delayBeforeDelete);
    } else if (isDeleting && displayText === '') {
      timeout = setTimeout(() => {
        setIsDeleting(false);
        setIterations(prev => prev + 1);
      }, delayBeforeRestart);
    } else if (!isDone) {
      const speed = isDeleting ? deletingSpeed : typingSpeed;
      timeout = setTimeout(() => {
        setDisplayText(prev => {
          if (isDeleting) {
            return prev.slice(0, -1);
          } else {
            return fullText.slice(0, prev.length + 1);
          }
        });
      }, speed);
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, iterations, isDone]);

  // Fetch owners effect
  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const response = await fetch('https://api.zukijourney.com/v1/models');
        const jsonResponse = await response.json();

        const ownerModelsMap = new Map();

        jsonResponse.data.forEach(model => {
          if (!ownerModelsMap.has(model.owned_by)) {
            ownerModelsMap.set(model.owned_by, []);
          }
          ownerModelsMap.get(model.owned_by).push(model.id);
        });

        const uniqueOwners = Array.from(ownerModelsMap).map(([owner, models]) => ({
          value: owner,
          label: owner
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' '),
          models: models
        }));

        setOwners(uniqueOwners);
        if (uniqueOwners.length > 0) {
          setSelectedOwner(uniqueOwners[0]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchOwners();
  }, []);

  const handleSendMessage = async () => {
    if (inputMessage.trim() && !isLoading) {
      const userMessage = {
        content: inputMessage,
        type: 'user',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setInputMessage('');
      setIsLoading(true);

      try {
        // Replace this with your actual API call
        // const response = await fetch('your-llm-api-endpoint', {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //     'Authorization': `Bearer ${apiKey}`
        //   },
        //   body: JSON.stringify({
        //     model: selectedModel?.value,
        //     messages: [...messages, userMessage]
        //   })
        // });
        // const data = await response.json();

        // Simulated response
        setTimeout(() => {
          const assistantMessage = {
            content: "This is a sample response from the LLM. Replace this with actual API response.",
            type: 'assistant',
            timestamp: new Date().toISOString()
          };
          setMessages(prev => [...prev, assistantMessage]);
          setIsLoading(false);
        }, 1000);

      } catch (error) {
        console.error('Error:', error);
        setIsLoading(false);
      }
    }
  };

  const modelOptions = selectedOwner ? selectedOwner.models.map((modelId) => ({
    value: modelId,
    label: modelId
  })) : [];

  const handleApiKeySubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('apiKey', apiKey);
    setShowApiInput(false);
  };

  const handleApiKeyClick = () => {
    setShowApiInput(true);
  };

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderColor: state.isFocused ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
      borderRadius: '8px',
      boxShadow: 'none',
      padding: '2px',
      transition: 'all 0.2s ease',
      '&:hover': {
        borderColor: 'rgba(255, 255, 255, 0.2)'
      }
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      borderRadius: '8px',
      padding: '4px',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
      color: 'white',
      padding: '10px 12px',
      cursor: 'pointer',
      borderRadius: '4px',
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.1)'
      }
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'white',
      fontSize: '14px'
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: 'rgba(255, 255, 255, 0.5)',
      '&:hover': {
        color: 'rgba(255, 255, 255, 0.8)'
      }
    }),
    indicatorSeparator: (provided) => ({
      ...provided,
      backgroundColor: 'rgba(255, 255, 255, 0.1)'
    }),
    placeholder: (provided) => ({
      ...provided,
      color: 'rgba(255, 255, 255, 0.5)'
    })
  };

  return (
    <div className="chat-container">
      <div className='header'>
        <div className="header-container">
          <div className="left-options">
            <div className='plus-button'>
              <Plus color="#ffffff" height={20} width={20} />
            </div>

            <div className="dropdown">
              <Select
                value={selectedOwner}
                onChange={setSelectedOwner}
                options={owners}
                styles={customStyles}
                placeholder="Select an owner"
              />
            </div>

            {selectedOwner && (
              <div className="dropdown">
                <Select
                  value={selectedModel}
                  onChange={setSelectedModel}
                  options={modelOptions}
                  styles={customStyles}
                  placeholder="Select a model"
                />
              </div>
            )}
          </div>

          <div className="heading">
            <h1 className="title">
              {displayText}
              {!isDone && <span className="cursor">|</span>}
            </h1>
          </div>

          <div className="right-options">
            {showApiInput ? (
              <form onSubmit={handleApiKeySubmit} className="api-key-form">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter API Key"
                  className="api-key-input"
                />
                <button type="submit" className="api-key-submit">
                  Save
                </button>
              </form>
            ) : (
              <div className="api-key-option" onClick={handleApiKeyClick}>
                <span>{apiKey ? 'Change API Key' : 'Add API Key'}</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
            )}

            <div className="download-option">
              <span>Export</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.type === 'user' ? 'user-message' : 'assistant-message'}`}
          >
            <div className="message-content">{message.content}</div>
            <div className="message-timestamp">
              {new Date(message.timestamp).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit'
              })}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message assistant-message">
            <div className="message-content typing-indicator">
              <span></span>
              <span style={{ animationDelay: '0.2s' }}></span>
              <span style={{ animationDelay: '0.4s' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <div className="chat-input-wrapper">
          <div className="chat-input-box">
            <textarea
              placeholder="Type a message..."
              className="message-input"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              rows={1}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
              }}
            />
            <button 
              className="send-button" 
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
            >
              <span>Send</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
          <div className="disclaimer">
            Messages may contain inaccurate information. Verify important details.
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;