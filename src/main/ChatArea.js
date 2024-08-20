import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './ChatArea.css';
import config from './../config';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SendIcon from '@mui/icons-material/Send';

const ChatArea = ({ selectedContact }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [userData, setUserData] = useState(null);
  const [networkId, setNetworkId] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const messageContainerRef = useRef(null);
  const initialLoadRef = useRef(true);
  const textAreaRef = useRef(null);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const contextMenuRef = useRef(null);

  useEffect(() => {
    const storedUserData = JSON.parse(localStorage.getItem('user'));
    if (storedUserData) {
      setUserData(storedUserData);
    }
  }, []);

  useEffect(() => {
    if (selectedContact) {
      setMessages([]); // Clear messages when a new contact is selected
      scrollToBottom(); // Scroll to bottom after clearing messages
      networkcheck(); // Check or create network connection
    }
  }, [selectedContact]);

  const networkcheck = async () => {
    try {
      const response = await axios.post(`${config.url}/searchconnection`, {
        userData: {
          username: userData.username,
          profilename: userData.profilename,
          email: userData.email,
        },
        receiverData: {
          username: selectedContact.username,
          profilename: selectedContact.profilename,
          email: selectedContact.email,
        }
      });
      const networkData = response.data;
      setNetworkId(networkData.networkid);
    } catch (error) {
      setNetworkId(null); // Reset networkId on error
      console.error('Error creating or finding chat connection', error);
    }
  };

  useEffect(() => {
    if (networkId) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 1000); // Fetch messages every second
      return () => clearInterval(interval); // Cleanup on unmount
    }
  }, [networkId]);

  const fetchMessages = async () => {
    try {
      if (!networkId) return; // Exit if networkId is not set
      const response = await axios.get(`${config.url}/viewchat/${networkId}`);
      const fetchedMessages = response.data.map(msg => ({
        ...msg,
        read: false
      }));
      setMessages(fetchedMessages);
      if (initialLoadRef.current) {
        scrollToBottom();
        initialLoadRef.current = false;
      }
    } catch (error) {
      console.error('Error fetching messages', error);
    }
  };

  const sendMessage = async () => {
    if (!networkId || !message) return;

    try {
      await axios.post(`${config.url}/sendmessage`, {
        networkid: networkId,
        sender: userData.username,
        msg: message
      });
      setMessage('');
      await fetchMessages(); // Fetch messages again after sending new message
      scrollToBottom(); // Scroll to bottom after sending message
    } catch (error) {
      console.error('Error sending message', error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent new line in textarea
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
      setShowScrollDown(false); // Hide the scroll down icon when scrolled to bottom
    }
  };

  const handleTextAreaChange = (e) => {
    setMessage(e.target.value);
    adjustTextAreaHeight();
  };

  const adjustTextAreaHeight = () => {
    const textarea = textAreaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; // Reset height
      textarea.style.height = `${Math.min(textarea.scrollHeight, 80)}px`; // Set height with limit
    }
  };

  const handleScroll = () => {
    if (messageContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messageContainerRef.current;
      setShowScrollDown(scrollTop > 0 && scrollTop + clientHeight < scrollHeight - 10);
    }
  };

  useEffect(() => {
    const container = messageContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [messageContainerRef.current]);

  const handleContextMenu = (event, message) => {
    event.preventDefault();
    setContextMenu({
      messageId: message._id,
      x: event.clientX,
      y: event.clientY
    });
  };

  const handleTouchStart = (event, message) => {
    event.preventDefault();
    setContextMenu({
      messageId: message._id,
      x: event.touches[0].clientX,
      y: event.touches[0].clientY
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleEditMessage = () => {
    console.log('Edit message', contextMenu.messageId);
    handleCloseContextMenu();
    // Implement edit functionality here
  };

  const handleDeleteMessage = () => {
    console.log('Delete message', contextMenu.messageId);
    handleCloseContextMenu();
    // Implement delete functionality here
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
        handleCloseContextMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [contextMenu]);

  return (
    <div className="chat-area">
      {selectedContact ? (
        <>
          <div ref={messageContainerRef} className="message-container">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`message ${msg.sender === userData.username ? 'sent' : 'received'} ${msg.read ? 'read' : 'unread'}`}
                onContextMenu={(e) => handleContextMenu(e, msg)}
                onTouchStart={(e) => handleTouchStart(e, msg)}
              >
                <div className="message-content">{msg.msg}</div>
                <div className="message-time">{msg.msgtime}</div>
              </div>
            ))}
          </div>
          <div className="chat-input">
            <textarea
              ref={textAreaRef}
              value={message}
              onChange={handleTextAreaChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message"
            />
            <button onClick={sendMessage} className="send-button">
              <SendIcon className="send-icon" />
            </button>
          </div>
          {showScrollDown && (
            <div className={`scroll-down-icon ${showScrollDown ? 'show' : ''}`} onClick={scrollToBottom}>
              <ArrowDownwardIcon />
            </div>
          )}
          {contextMenu && (
            <div
              ref={contextMenuRef}
              className={`context-menu show ${document.body.classList.contains('dark-theme') ? 'dark-theme' : ''}`}
              style={{ top: contextMenu.y, left: contextMenu.x }}
              onClick={handleCloseContextMenu}
            >
              <div className="context-menu-item" onClick={handleEditMessage}>Edit</div>
              <div className="context-menu-item" onClick={handleDeleteMessage}>Delete</div>
            </div>
          )}
        </>
      ) : (
        <p className="select-to-chat">Select a contact to start chatting</p>
      )}
    </div>
  );
};

export default ChatArea;
