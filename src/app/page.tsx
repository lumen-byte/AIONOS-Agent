"use client";

import { useEffect, useState, useRef } from "react";
import { Sparkles, Calendar, Mail, Mic, MessageSquare, Send, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import styles from "./page.module.css";
import contextData from "../data/context.json";
import type { DailyBrief } from "@/lib/agent";

type Tab = "brief" | "chat";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("brief");
  const [brief, setBrief] = useState<DailyBrief | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Chat state
  const [chatHistory, setChatHistory] = useState<{role: "user"|"agent", content: string}[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/brief")
      .then(res => res.json())
      .then(data => {
        setBrief(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load brief:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleSendMessage = async (presetText?: string) => {
    const textToSend = presetText || inputValue;
    if (!textToSend.trim()) return;

    const newHistory = [...chatHistory, { role: "user" as const, content: textToSend }];
    setChatHistory(newHistory);
    setInputValue("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: textToSend }),
      });
      const data = await res.json();
      setChatHistory([...newHistory, { role: "agent", content: data.answer }]);
    } catch (err) {
      setChatHistory([...newHistory, { role: "agent", content: "Sorry, I encountered an error." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const presetQuestions = [
    "What did I promise Raghav?",
    "What's the status of the Q3 Deck?",
    "What are my deadlines for today?"
  ];

  const getSourceIcon = (type: string) => {
    switch (type) {
      case "meeting_transcript": return <MessageSquare size={16} />;
      case "calendar": return <Calendar size={16} />;
      case "email_thread": return <Mail size={16} />;
      case "voice_note": return <Mic size={16} />;
      default: return <Sparkles size={16} />;
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <Sparkles className="text-blue-500" />
          AIONOS Agent <span style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>for Arjun Malhotra</span>
        </div>
      </header>

      {/* Sidebar: Raw Data Sources */}
      <aside className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>Data Pack (Context)</h2>
        {contextData.sources.map((source: any, idx: number) => (
          <div key={idx} className={styles.sourceCard}>
            <div className={styles.sourceType}>
              {getSourceIcon(source.type)}
              <span style={{marginLeft: '6px'}}>{source.type.replace("_", " ")}</span>
            </div>
            <div className={styles.sourceTitle}>
              {source.title || source.subject || (source.type === 'calendar' ? 'Calendar Events' : `Voice Note ${source.id}`)}
            </div>
          </div>
        ))}
      </aside>

      {/* Main Area: Brief & Chat */}
      <main className={styles.mainArea}>
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'brief' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('brief')}
          >
            Daily Action Brief
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'chat' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            Ask Questions
          </button>
        </div>

        <div className={styles.contentArea}>
          {activeTab === "brief" && (
            <div className="animate-fade-in">
              {loading ? (
                <div className={styles.loader}>
                  <Sparkles className="animate-spin" size={32} />
                  <span style={{marginLeft: '12px'}}>Analyzing messy inputs...</span>
                </div>
              ) : brief ? (
                <>
                  <Section title="My Actions" icon={<CheckCircle2 className="text-blue-500" />}>
                    <div className={styles.taskGrid}>
                      {brief.myActions.map(task => <TaskCard key={task.id} task={task} />)}
                    </div>
                  </Section>

                  <Section title="Waiting on Others" icon={<Clock className="text-yellow-500" />}>
                    <div className={styles.taskGrid}>
                      {brief.waitingOnOthers.map(task => (
                        <TaskCard key={task.id} task={{...task, status: 'none'}} subtext={`Waiting on: ${task.owner}`} />
                      ))}
                    </div>
                  </Section>

                  <Section title="Unclear Ownership" icon={<AlertCircle className="text-red-500" />}>
                    <div className={styles.taskGrid}>
                      {brief.unclearOwnership.map(task => (
                        <TaskCard key={task.id} task={{...task, status: 'none'}} subtext={`Potential owners: ${task.potentialOwners.join(", ")}`} />
                      ))}
                    </div>
                  </Section>

                  <Section title="Commitments Made" icon={<MessageSquare className="text-green-500" />}>
                    <div className={styles.taskGrid}>
                      {brief.commitments.map(task => (
                        <TaskCard key={task.id} task={{...task, status: 'none'}} subtext={`Promised to: ${task.recipient}`} />
                      ))}
                    </div>
                  </Section>
                </>
              ) : (
                <p>Failed to load brief.</p>
              )}
            </div>
          )}

          {activeTab === "chat" && (
            <div className={`${styles.chatContainer} animate-fade-in`}>
              <div className={styles.chatHistory}>
                {chatHistory.length === 0 ? (
                  <div style={{textAlign: 'center', color: 'var(--text-secondary)', marginTop: '2rem'}}>
                    <Sparkles size={48} style={{margin: '0 auto', opacity: 0.2}} />
                    <p style={{marginTop: '1rem'}}>Ask me anything about Arjun's commitments, emails, or meetings.</p>
                    <p style={{fontSize: '0.85rem', marginTop: '0.5rem'}}>Try: "What did I promise Raghav?"</p>
                  </div>
                ) : (
                  chatHistory.map((msg, idx) => (
                    <div key={idx} className={`${styles.message} ${styles[msg.role]}`}>
                      {msg.content}
                    </div>
                  ))
                )}
                {chatLoading && (
                  <div className={`${styles.message} ${styles.agent}`}>
                    <Sparkles className="animate-spin" size={16} style={{display: 'inline-block'}} /> Thinking...
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              
              <div className={styles.presetChips}>
                {presetQuestions.map((q, idx) => (
                  <button 
                    key={idx} 
                    className={styles.presetChip}
                    onClick={() => handleSendMessage(q)}
                    disabled={chatLoading}
                  >
                    {q}
                  </button>
                ))}
              </div>
              
              <div className={styles.chatInputArea}>
                <input 
                  type="text" 
                  className={styles.chatInput}
                  placeholder="Ask a question..."
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                />
                <button 
                  className={styles.sendButton}
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || chatLoading}
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function Section({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) {
  return (
    <div className={styles.section}>
      <h3 className={styles.sectionHeader}>
        {icon} {title}
      </h3>
      {children}
    </div>
  );
}

function TaskCard({ task, subtext }: { task: any, subtext?: string }) {
  return (
    <div className={`${styles.taskCard} ${styles[task.status] || ''}`}>
      {task.status !== 'none' && task.status && (
        <span className={`${styles.badge} ${styles[task.status]}`}>
          {task.status.replace("_", " ")}
        </span>
      )}
      <div className={styles.taskTitle}>{task.task}</div>
      {subtext && <div className={styles.taskMeta} style={{color: 'var(--accent)'}}>{subtext}</div>}
      <div className={styles.taskMeta}>
        <Clock size={14} /> {task.deadline || "No deadline"}
      </div>
      <div className={styles.taskMeta}>
        <Mail size={14} /> {task.source}
      </div>
    </div>
  );
}
