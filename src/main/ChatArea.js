import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./ChatArea.css";
import config from "./../config";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import SendIcon from "@mui/icons-material/Send";
import DoneIcon from "@mui/icons-material/Done";
import DoneAllIcon from '@mui/icons-material/DoneAll';

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

  // Fetch user data from localStorage
  useEffect(() => {
    const storedUserData = JSON.parse(localStorage.getItem("user"));
    if (storedUserData) {
      setUserData(storedUserData);
    }
  }, []);

  // Check or create network connection
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
        },
      });
      setNetworkId(response.data.networkid);
    } catch (error) {
      console.error("Error creating or finding chat connection", error);
    }
  };

  // Fetch messages every second when networkId is available
  useEffect(() => {
    if (networkId) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 1000);
      return () => clearInterval(interval);
    }
  }, [networkId]);

  const fetchMessages = async () => {
    try {
      if (!networkId) return;
      const response = await axios.get(`${config.url}/viewchat/${networkId}`);
      setMessages(response.data);
      if (initialLoadRef.current) {
        scrollToBottom();
        initialLoadRef.current = false;
      }
    } catch (error) {
      console.error("Error fetching messages", error);
    }
  };

  // Send a new message
  const sendMessage = async () => {
    if (!networkId || !message) return;

    try {
      await axios.post(`${config.url}/sendmessage`, {
        networkid: networkId,
        sender: userData.username,
        msg: message,
      });
      setMessage(""); // Clear input field
      fetchMessages(); // Refresh messages after sending
      scrollToBottom(); // Scroll to bottom after sending message
    } catch (error) {
      console.error("Error sending message", error);
    }
  };

  const handleContextMenu = (event, message) => {
    event.preventDefault();
    setContextMenu({
      messageId: message._id, // Store the message ID in the context menu state
      x: event.clientX,
      y: event.clientY
    });
  };

  const handleTouchStart = (event, message) => {
    event.preventDefault();
    setContextMenu({
      messageId: message._id, // Store the message ID in the context menu state
      x: event.touches[0].clientX,
      y: event.touches[0].clientY
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleMouseEnter = async (messageId, sender) => {
    if (sender !== userData.username) {
      try {
        await axios.put(`${config.url}/updateseen/${messageId}`, {
          readStatus: true
        });
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg._id === messageId ? { ...msg, read: true } : msg
          )
        );
      } catch (error) {
        console.error('Error updating message read status', error);
      }
    }
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

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
      setShowScrollDown(false); // Hide the scroll down icon when at the bottom
    }
  };

  // Handle textarea input change
  const handleTextAreaChange = (e) => {
    setMessage(e.target.value);
    adjustTextAreaHeight();
  };

  // Adjust textarea height dynamically
  const adjustTextAreaHeight = () => {
    const textarea = textAreaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 80)}px`; // Max height of 80px
    }
  };

  // Handle scroll event to show/hide scroll down button
  const handleScroll = () => {
    if (messageContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messageContainerRef.current;
      setShowScrollDown(scrollTop + clientHeight < scrollHeight - 10);
    }
  };

  // Add scroll event listener
  useEffect(() => {
    const container = messageContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  return (
    <div className="chat-area">
      {selectedContact ? (
        <>
          <div ref={messageContainerRef} className="message-container">
            {Array.isArray(messages) && messages.length > 0 ? (
              messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`message-item ${msg.sender === userData.username ? 'sent' : 'received'} ${msg.read ? 'read' : 'unread'}`}
                  onContextMenu={(e) => handleContextMenu(e, msg)}
                  onTouchStart={(e) => handleTouchStart(e, msg)}
                  onMouseEnter={() => handleMouseEnter(msg._id, msg.sender)} // Handle hover
                >
                  <div className="message-content">{msg.msg}</div>
                  <div className="message-time">
                    {msg.msgtime}
                    {msg.sender === userData.username && msg.read && (
                      <DoneAllIcon className="tick-icon read-tick" />
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div>No messages to display</div>
            )}
          </div>

          <div className="chat-input">
            <textarea
                ref={textAreaRef}
              value={message}
              onChange={handleTextAreaChange}
                placeholder="Type a message"
                onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <button onClick={sendMessage} className="send-button">
              <SendIcon className="send-icon" />
            </button>
          </div>

          {showScrollDown && (
            <div
              className={`scroll-down-icon ${showScrollDown ? "show" : ""}`}
              onClick={scrollToBottom}
            >
              <ArrowDownwardIcon />
            </div>
          )}
        </>
      ) : (
        <div className="select-to-chat">Select a contact to start chatting</div>
      )}
    </div>
  );
};

export default ChatArea;
