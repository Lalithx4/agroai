'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import BackButton from '@/components/layout/BackButton';
import { chatWithPlant } from '@/services/api';
import { Sprout, Volume2, VolumeX, Mic, Send, HelpCircle, Droplets, Lightbulb, Loader2 } from 'lucide-react';

export default function ChatPage() {
    const { t, language } = useLanguage();
    const { showToast } = useToast();
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [ttsEnabled, setTtsEnabled] = useState(true);

    useEffect(() => {
        if (messages.length === 0) {
            addMessage('plant', t('chatWelcome'));
        }
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const addMessage = (sender, text) => {
        setMessages(prev => [...prev, {
            sender,
            text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
    };

    const sendMessage = async () => {
        const message = inputValue.trim();
        if (!message) return;

        setInputValue('');
        addMessage('user', message);
        setIsTyping(true);

        try {
            const response = await chatWithPlant(message, 'plant', 'unknown', language);
            if (response?.reply) {
                addMessage('plant', response.reply);
                if (ttsEnabled && 'speechSynthesis' in window) {
                    const utterance = new SpeechSynthesisUtterance(response.reply);
                    utterance.lang = language === 'hi' ? 'hi-IN' : language === 'te' ? 'te-IN' : 'en-US';
                    window.speechSynthesis.speak(utterance);
                }
            } else {
                addMessage('plant', 'I can help you with plant care tips, disease identification, and farming advice. What would you like to know?');
            }
        } catch {
            addMessage('plant', t('chatError'));
        } finally {
            setIsTyping(false);
        }
    };

    const quickReplies = [
        { text: 'How are you?', icon: HelpCircle },
        { text: 'Water tips?', icon: Droplets },
        { text: 'Plant care', icon: Lightbulb }
    ];

    return (
        <section className="screen active" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 80px)' }}>
            <div className="chat-header">
                <BackButton />
                <div className="chat-plant-info">
                    <span className="plant-emoji"><Sprout size={20} /></span>
                    <div className="plant-details">
                        <span className="plant-name">{t('plantChat')}</span>
                        <span className="plant-status">{isTyping ? 'Typing...' : 'Online'}</span>
                    </div>
                </div>
                <button className={`tts-btn ${ttsEnabled ? 'active' : ''}`} onClick={() => setTtsEnabled(!ttsEnabled)}>
                    {ttsEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                </button>
            </div>

            <div className="chat-body" style={{ flex: 1, overflowY: 'auto', paddingBottom: 'var(--space-3)' }}>
                <div className="chat-messages">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`message ${msg.sender}`}>
                            <div className="message-bubble">{msg.text}</div>
                            <div className="message-time">{msg.time}</div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="typing-indicator">
                            <span></span><span></span><span></span>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            <div className="quick-replies">
                {quickReplies.map((reply, idx) => (
                    <button key={idx} onClick={() => setInputValue(reply.text)}>
                        <reply.icon size={14} />
                        <span>{reply.text}</span>
                    </button>
                ))}
            </div>

            <div className="chat-input-bar">
                <button className="mic-btn" onClick={() => showToast('Voice coming soon')}>
                    <Mic size={18} />
                </button>
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                />
                <button className="send-btn" onClick={sendMessage} disabled={!inputValue.trim()}>
                    <Send size={18} />
                </button>
            </div>
        </section>
    );
}
