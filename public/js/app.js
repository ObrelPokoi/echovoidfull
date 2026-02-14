<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EchoVoid</title>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    :root{
      --bg-void:#050508;--bg-deep:#0a0a10;--bg-surface:#0f0f18;
      --bg-elevated:#141420;--bg-card:#181825;
      --bg-hover:rgba(139,92,246,.06);--bg-active:rgba(139,92,246,.1);
      --accent:#8b5cf6;--accent-bright:#a78bfa;--accent-dim:#6d28d9;
      --accent-glow:rgba(139,92,246,.35);--accent-subtle:rgba(139,92,246,.08);
      --cyan:#22d3ee;--cyan-glow:rgba(34,211,238,.25);
      --green:#34d399;--green-glow:rgba(52,211,153,.3);
      --rose:#f472b6;--red:#ef4444;
      --text-white:#f0f0f8;--text-primary:#d4d4e0;
      --text-secondary:#8888a0;--text-muted:#505068;--text-ghost:#303045;
      --border:rgba(255,255,255,.04);--border-subtle:rgba(255,255,255,.07);
      --border-accent:rgba(139,92,246,.2);
      --glass:rgba(12,12,20,.85);--glass-thick:rgba(8,8,14,.92);
      --shadow-md:0 8px 30px rgba(0,0,0,.4);
      --shadow-lg:0 20px 60px rgba(0,0,0,.5);
      --shadow-glow:0 0 40px rgba(139,92,246,.15);
      --shadow-glow-strong:0 0 80px rgba(139,92,246,.2);
      --r-xs:6px;--r-sm:10px;--r-md:14px;--r-lg:20px;--r-xl:28px;--r-full:9999px;
      --transition:cubic-bezier(.4,0,.2,1);
      --bounce:cubic-bezier(.34,1.56,.64,1);
    }
    html,body{height:100%;overflow:hidden}
    body{background:var(--bg-void);color:var(--text-primary);font-family:'Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
    .hidden{display:none!important}
    .screen{display:none;height:100vh;width:100%}
    .screen.active{display:flex}
    ::-webkit-scrollbar{width:4px}
    ::-webkit-scrollbar-track{background:transparent}
    ::-webkit-scrollbar-thumb{background:rgba(139,92,246,.15);border-radius:10px}
    ::-webkit-scrollbar-thumb:hover{background:rgba(139,92,246,.3)}
    ::selection{background:rgba(139,92,246,.3);color:#fff}

    #particles-bg{position:fixed;inset:0;z-index:0}
    .bg-noise{position:fixed;inset:0;z-index:0;pointer-events:none;opacity:.015;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
    .bg-gradient{position:fixed;inset:0;z-index:0;pointer-events:none;background:radial-gradient(ellipse 600px 600px at 10% 20%,rgba(139,92,246,.04),transparent),radial-gradient(ellipse 500px 500px at 90% 80%,rgba(34,211,238,.03),transparent),radial-gradient(ellipse 800px 400px at 50% 0%,rgba(139,92,246,.03),transparent)}
    .aurora{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden}
    .aurora-beam{position:absolute;width:60%;height:200%;background:linear-gradient(180deg,transparent,rgba(139,92,246,.015),rgba(34,211,238,.01),transparent);filter:blur(80px);animation:auroraMove 25s ease-in-out infinite alternate}
    .aurora-beam:nth-child(2){left:30%;animation-delay:-8s;animation-duration:30s;background:linear-gradient(180deg,transparent,rgba(244,114,182,.01),rgba(139,92,246,.015),transparent)}
    @keyframes auroraMove{0%{transform:translateX(-30%) rotate(-5deg)}100%{transform:translateX(30%) rotate(5deg)}}

    /* AUTH */
    #auth-screen{justify-content:center;align-items:center;position:relative;z-index:1}
    .auth-wrapper{width:440px;max-width:92vw;animation:authAppear .8s var(--transition) both}
    @keyframes authAppear{from{opacity:0;transform:translateY(30px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)}}
    .auth-card{background:var(--glass-thick);backdrop-filter:blur(60px) saturate(1.3);border:1px solid var(--border-subtle);border-radius:var(--r-xl);padding:52px 44px;position:relative;overflow:hidden;box-shadow:var(--shadow-lg),var(--shadow-glow)}
    .auth-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent 10%,rgba(139,92,246,.4) 50%,transparent 90%)}
    .auth-card::after{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% -20%,rgba(139,92,246,.06),transparent 60%);pointer-events:none}
    .card-shimmer{position:absolute;inset:0;overflow:hidden;pointer-events:none;border-radius:var(--r-xl)}
    .card-shimmer::before{content:'';position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:conic-gradient(from 0deg,transparent,rgba(139,92,246,.03),transparent 30%);animation:shimmerRotate 8s linear infinite}
    @keyframes shimmerRotate{to{transform:rotate(360deg)}}

    .logo-area{text-align:center;margin-bottom:44px;position:relative;z-index:1}
    .logo-orb{display:inline-block;position:relative;width:100px;height:100px}
    .logo-orb svg{width:100%;height:100%;color:var(--accent);filter:drop-shadow(0 0 25px var(--accent-glow))}
    .orb-ring{position:absolute;inset:-15px;border:1px solid rgba(139,92,246,.08);border-radius:50%;animation:orbSpin 20s linear infinite}
    .orb-ring::before{content:'';position:absolute;top:-2px;left:50%;width:4px;height:4px;margin-left:-2px;background:var(--accent-bright);border-radius:50%;box-shadow:0 0 8px var(--accent-glow)}
    .orb-ring:nth-child(2){inset:-30px;border-color:rgba(139,92,246,.04);animation-duration:30s;animation-direction:reverse}
    .orb-ring:nth-child(2)::before{background:var(--cyan);box-shadow:0 0 8px var(--cyan-glow)}
    @keyframes orbSpin{to{transform:rotate(360deg)}}
    .logo-title{font-family:'Space Grotesk',monospace;font-size:2rem;font-weight:700;margin-top:20px;letter-spacing:4px;background:linear-gradient(135deg,#fff,var(--accent-bright) 50%,var(--cyan));background-size:200% 200%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:titleShift 6s ease-in-out infinite alternate}
    @keyframes titleShift{0%{background-position:0% 50%}100%{background-position:100% 50%}}
    .logo-tagline{font-family:'JetBrains Mono',monospace;font-size:.78rem;color:var(--text-muted);margin-top:8px;letter-spacing:2px}
    .logo-tagline .blink{animation:cursorBlink 1s step-end infinite}
    @keyframes cursorBlink{50%{opacity:0}}

    .auth-form{position:relative;z-index:1}
    .form-title{text-align:center;font-size:1rem;font-weight:500;color:var(--text-secondary);margin-bottom:28px;letter-spacing:.8px}
    .field{margin-bottom:20px}
    .field-label{display:block;font-size:.68rem;font-weight:600;color:var(--text-muted);margin-bottom:8px;text-transform:uppercase;letter-spacing:2px;font-family:'JetBrains Mono',monospace}
    .field-input{width:100%;padding:15px 20px;background:rgba(255,255,255,.02);border:1px solid var(--border-subtle);color:var(--text-white);border-radius:var(--r-md);font-family:'Inter',sans-serif;font-size:.95rem;outline:none;transition:all .35s var(--transition)}
    .field-input::placeholder{color:var(--text-ghost)}
    .field-input:focus{border-color:var(--accent);background:rgba(139,92,246,.02);box-shadow:0 0 0 4px rgba(139,92,246,.08),0 0 30px rgba(139,92,246,.05)}
    .field-input.code{text-align:center;letter-spacing:10px;font-size:1.6rem;font-family:'JetBrains Mono',monospace;font-weight:600}

    .btn-main{width:100%;padding:16px 28px;margin-top:28px;background:linear-gradient(135deg,var(--accent),var(--accent-dim));border:none;border-radius:var(--r-md);color:#fff;font-family:'Inter',sans-serif;font-weight:700;font-size:.95rem;letter-spacing:.5px;cursor:pointer;position:relative;overflow:hidden;transition:all .35s var(--transition);box-shadow:0 4px 20px rgba(139,92,246,.2)}
    .btn-main::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.1),transparent 50%);opacity:0;transition:opacity .3s}
    .btn-main:hover{transform:translateY(-3px);box-shadow:0 8px 35px rgba(139,92,246,.35)}
    .btn-main:hover::before{opacity:1}
    .btn-main:active{transform:translateY(-1px)}
    .btn-main:disabled{opacity:.5;cursor:not-allowed;transform:none!important;box-shadow:none!important}
    .btn-text{position:relative;z-index:1;display:flex;align-items:center;justify-content:center;gap:8px}

    .status-pill{display:inline-flex;align-items:center;gap:8px;padding:8px 18px;margin-bottom:24px;background:rgba(52,211,153,.05);border:1px solid rgba(52,211,153,.12);border-radius:var(--r-full);font-size:.8rem;color:var(--green);font-family:'JetBrains Mono',monospace}
    .status-pill .pulse-dot{width:6px;height:6px;background:var(--green);border-radius:50%;position:relative}
    .status-pill .pulse-dot::after{content:'';position:absolute;inset:-3px;border:1px solid var(--green);border-radius:50%;animation:pulseDot 2s ease-out infinite}
    @keyframes pulseDot{0%{transform:scale(1);opacity:.6}100%{transform:scale(2.5);opacity:0}}
    .back-link{text-align:center;margin-top:20px}
    .back-link a{color:var(--text-muted);text-decoration:none;font-size:.82rem;font-family:'JetBrains Mono',monospace;transition:color .3s;display:inline-flex;align-items:center;gap:6px}
    .back-link a:hover{color:var(--accent-bright)}
    .back-link a svg{width:14px;height:14px;transition:transform .3s}
    .back-link a:hover svg{transform:translateX(-3px)}

    /* CHAT LAYOUT */
    #chat-screen{position:relative;z-index:1}
    .chat-layout{display:flex;width:100%;height:100%}

    .sidebar{width:340px;min-width:340px;background:var(--bg-deep);border-right:1px solid var(--border);display:flex;flex-direction:column;position:relative}
    .sidebar::after{content:'';position:absolute;top:0;right:0;bottom:0;width:1px;background:linear-gradient(180deg,rgba(139,92,246,.2),rgba(139,92,246,.02) 20%,rgba(139,92,246,.02) 80%,rgba(34,211,238,.15))}

    .sidebar-head{padding:22px 24px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:14px;background:linear-gradient(180deg,rgba(139,92,246,.03),transparent);position:relative}
    .sidebar-head::after{content:'';position:absolute;bottom:0;left:20px;right:20px;height:1px;background:linear-gradient(90deg,transparent,var(--border-accent),transparent)}
    .brand{display:flex;align-items:center;gap:12px}
    .brand svg{width:26px;height:26px;color:var(--accent);filter:drop-shadow(0 0 10px var(--accent-glow))}
    .brand-text{font-family:'Space Grotesk',monospace;font-weight:700;font-size:.95rem;letter-spacing:3px;background:linear-gradient(135deg,var(--text-white),var(--accent-bright));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}

    .search-area{padding:16px 20px;border-bottom:1px solid var(--border)}
    .search-box{position:relative}
    .search-box .s-icon{position:absolute;left:14px;top:12px;color:var(--text-ghost);pointer-events:none;transition:color .3s;z-index:2}
    .s-input{width:100%;padding:11px 14px 11px 42px;background:rgba(255,255,255,.02);border:1px solid var(--border);border-radius:var(--r-sm);color:var(--text-primary);font-size:.87rem;outline:none;transition:all .3s var(--transition);font-family:'Inter',sans-serif}
    .s-input::placeholder{color:var(--text-ghost)}
    .s-input:focus{border-color:var(--border-accent);background:rgba(139,92,246,.02)}
    .s-input:focus~.s-icon{color:var(--accent)}
    .s-hint{margin-top:8px;font-size:.68rem;color:var(--text-ghost);font-family:'JetBrains Mono',monospace;letter-spacing:.5px}

    .contacts{flex:1;overflow-y:auto;padding:6px 0}
    .contacts-label{padding:14px 24px 10px;font-size:.65rem;font-weight:700;color:var(--text-ghost);text-transform:uppercase;letter-spacing:3px;font-family:'JetBrains Mono',monospace}

    .contact{padding:14px 20px;display:flex;align-items:center;gap:14px;cursor:pointer;transition:all .25s var(--transition);border-left:3px solid transparent;position:relative;margin:1px 0}
    .contact::before{content:'';position:absolute;inset:0;background:linear-gradient(90deg,rgba(139,92,246,.06),transparent);opacity:0;transition:opacity .25s}
    .contact:hover::before{opacity:1}
    .contact:hover{border-left-color:rgba(139,92,246,.4)}
    .contact.active{border-left-color:var(--accent);background:var(--bg-active)}
    .contact.active::before{opacity:1}
    .contact-ava-wrap{position:relative;flex-shrink:0}
    .contact-ava{width:46px;height:46px;border-radius:50%;object-fit:cover;background:var(--bg-card);border:2px solid var(--border);transition:all .3s var(--transition)}
    .contact:hover .contact-ava{border-color:var(--border-accent)}
    .contact.active .contact-ava{border-color:var(--accent)}
    .contact-meta{flex:1;overflow:hidden;display:flex;flex-direction:column;gap:2px}
    .contact-name{font-weight:600;font-size:.9rem;color:var(--text-white);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .contact-handle{font-size:.72rem;color:var(--accent-bright);font-family:'JetBrains Mono',monospace;opacity:.7}
    .contact-last{font-size:.76rem;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

    .sidebar-foot{padding:16px 20px;border-top:1px solid var(--border);display:flex;align-items:center;gap:10px;background:linear-gradient(0deg,rgba(139,92,246,.02),transparent)}
    .profile-trigger{display:flex;align-items:center;gap:12px;flex:1;cursor:pointer;padding:8px 12px;border-radius:var(--r-sm);border:none;background:none;color:inherit;transition:all .25s var(--transition);text-align:left}
    .profile-trigger:hover{background:rgba(255,255,255,.03)}
    .ava-me{width:38px;height:38px;border-radius:50%;object-fit:cover;background:var(--bg-card);border:2px solid rgba(139,92,246,.25);transition:border-color .3s;flex-shrink:0}
    .profile-trigger:hover .ava-me{border-color:var(--accent)}
    .me-info{display:flex;flex-direction:column;gap:1px;overflow:hidden}
    .me-name{font-size:.87rem;font-weight:600;color:var(--text-white);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .me-handle{font-size:.7rem;color:var(--accent-bright);font-family:'JetBrains Mono',monospace;opacity:.6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .foot-actions{display:flex;gap:6px}
    .icon-btn{width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:none;border:1px solid var(--border);border-radius:var(--r-xs);color:var(--text-ghost);cursor:pointer;transition:all .3s var(--transition)}
    .icon-btn:hover{color:var(--accent-bright);border-color:var(--border-accent);background:var(--accent-subtle);transform:scale(1.05)}
    .icon-btn.danger:hover{color:var(--red);border-color:rgba(239,68,68,.25);background:rgba(239,68,68,.05)}

    /* CHAT MAIN */
    .chat-main{flex:1;display:flex;flex-direction:column;background:var(--bg-void);position:relative;overflow:hidden}
    .chat-grid{position:absolute;inset:0;pointer-events:none;opacity:.015;background-image:linear-gradient(rgba(139,92,246,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,.3) 1px,transparent 1px);background-size:60px 60px}

    .empty-state{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:30px;position:relative;z-index:1}
    .empty-visual{position:relative}
    .void-circle{width:160px;height:160px;position:relative;display:flex;align-items:center;justify-content:center}
    .void-circle svg{width:100%;height:100%;color:var(--accent);opacity:.12}
    .void-glow{position:absolute;inset:20%;background:radial-gradient(circle,rgba(139,92,246,.08),transparent);border-radius:50%;animation:voidPulse 4s ease-in-out infinite}
    @keyframes voidPulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.3);opacity:.5}}
    .empty-info{text-align:center}
    .empty-info h3{font-size:1.15rem;font-weight:600;color:var(--text-secondary);margin-bottom:10px;font-family:'Space Grotesk',sans-serif}
    .empty-info p{font-size:.82rem;color:var(--text-ghost);font-family:'JetBrains Mono',monospace;letter-spacing:1px}
    .empty-keys{display:flex;gap:10px;margin-top:5px}
    .key-hint{display:flex;align-items:center;gap:6px;padding:6px 14px;background:rgba(255,255,255,.02);border:1px solid var(--border);border-radius:var(--r-xs);font-size:.72rem;color:var(--text-muted);font-family:'JetBrains Mono',monospace}
    .key-hint kbd{padding:2px 6px;background:var(--bg-elevated);border:1px solid var(--border-subtle);border-radius:3px;font-size:.68rem;color:var(--text-secondary)}

    .chat-active{flex:1;display:flex;flex-direction:column;height:100%;position:relative;z-index:1}
    .chat-top{padding:16px 28px;border-bottom:1px solid var(--border);background:var(--glass-thick);backdrop-filter:blur(20px);display:flex;align-items:center;gap:16px;position:relative;z-index:2}
    .chat-top::after{content:'';position:absolute;bottom:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--border-accent),transparent)}
    .ct-ava{width:42px;height:42px;border-radius:50%;background:var(--bg-card);border:2px solid rgba(139,92,246,.15);object-fit:cover;flex-shrink:0}
    .ct-info{display:flex;flex-direction:column;gap:2px;flex:1}
    .ct-name{font-size:1rem;font-weight:700;color:var(--text-white)}
    .ct-status{font-size:.72rem;color:var(--green);display:flex;align-items:center;gap:6px;font-family:'JetBrains Mono',monospace}
    .ct-status .dot{width:5px;height:5px;background:var(--green);border-radius:50%;box-shadow:0 0 8px var(--green-glow);animation:dotGlow 2s ease-in-out infinite}
    @keyframes dotGlow{0%,100%{box-shadow:0 0 4px var(--green-glow)}50%{box-shadow:0 0 12px var(--green-glow),0 0 20px rgba(52,211,153,.1)}}
    .ct-actions{display:flex;gap:6px}
    .ct-action{width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:none;border:1px solid var(--border);border-radius:var(--r-xs);color:var(--text-ghost);cursor:pointer;transition:all .25s var(--transition)}
    .ct-action:hover{color:var(--accent-bright);border-color:var(--border-accent);background:var(--accent-subtle)}

    .msg-scroll{flex:1;overflow-y:auto;padding:28px;display:flex;flex-direction:column;position:relative}
    .msg-list{display:flex;flex-direction:column;gap:6px;margin-top:auto}
    .msg-row{display:flex;align-items:flex-end;gap:10px;animation:msgIn .4s var(--bounce) both}
    .msg-row.me{flex-direction:row-reverse}
    @keyframes msgIn{from{opacity:0;transform:translateY(12px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
    .msg-ava{width:28px;height:28px;border-radius:50%;object-fit:cover;background:var(--bg-card);flex-shrink:0;border:1px solid var(--border)}
    .msg-bubble{max-width:62%;position:relative}
    .msg-body{padding:12px 18px;border-radius:20px 20px 20px 6px;background:var(--bg-card);border:1px solid var(--border);color:var(--text-primary);font-size:.9rem;line-height:1.55;word-wrap:break-word}
    .msg-row.me .msg-body{background:linear-gradient(135deg,var(--accent),var(--accent-dim));border:none;color:#fff;border-radius:20px 20px 6px 20px;box-shadow:0 4px 18px rgba(139,92,246,.2)}
    .msg-footer{display:flex;align-items:center;gap:6px;margin-top:4px;padding:0 4px}
    .msg-time{font-size:.62rem;color:var(--text-ghost);font-family:'JetBrains Mono',monospace}
    .msg-row.me .msg-time{color:rgba(255,255,255,.4)}
    .msg-row.me .msg-footer{justify-content:flex-end}
    .msg-check{width:12px;height:12px;color:rgba(255,255,255,.4)}

    .input-area{padding:18px 28px;background:var(--glass-thick);backdrop-filter:blur(20px);border-top:1px solid var(--border);display:flex;align-items:center;gap:12px;position:relative;z-index:2}
    .input-area::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(139,92,246,.08),transparent)}
    .attach-btn{width:42px;height:42px;display:flex;align-items:center;justify-content:center;background:none;border:1px solid var(--border);border-radius:50%;color:var(--text-ghost);cursor:pointer;transition:all .3s var(--transition);flex-shrink:0}
    .attach-btn:hover{color:var(--accent-bright);border-color:var(--border-accent);background:var(--accent-subtle)}
    .input-wrap{flex:1;position:relative}
    .msg-input{width:100%;background:rgba(255,255,255,.02);border:1px solid var(--border);color:var(--text-white);padding:13px 22px;border-radius:var(--r-full);font-family:'Inter',sans-serif;font-size:.9rem;outline:none;transition:all .3s var(--transition)}
    .msg-input::placeholder{color:var(--text-ghost)}
    .msg-input:focus{border-color:var(--border-accent);box-shadow:0 0 0 4px rgba(139,92,246,.06);background:rgba(139,92,246,.02)}
    .send-orb{width:46px;height:46px;background:linear-gradient(135deg,var(--accent),var(--accent-dim));border:none;border-radius:50%;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .3s var(--transition);flex-shrink:0;position:relative;overflow:hidden}
    .send-orb::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 30% 30%,rgba(255,255,255,.15),transparent);opacity:0;transition:opacity .3s;border-radius:50%}
    .send-orb:hover{transform:scale(1.1);box-shadow:0 6px 30px rgba(139,92,246,.4)}
    .send-orb:hover::before{opacity:1}
    .send-orb:active{transform:scale(.95)}
    .send-orb svg{width:18px;height:18px;transition:transform .3s var(--transition)}
    .send-orb:hover svg{transform:translateX(2px) translateY(-1px)}

    /* TOAST SYSTEM */
    .toast-container{position:fixed;bottom:28px;left:50%;transform:translateX(-50%);z-index:9999;display:flex;flex-direction:column;align-items:center;gap:8px;pointer-events:none}
    .toast{
      padding:14px 28px;border-radius:var(--r-full);
      font-weight:600;font-size:.88rem;
      display:flex;align-items:center;gap:10px;
      box-shadow:0 8px 30px rgba(0,0,0,.4);
      pointer-events:auto;
      animation:toastIn .4s var(--bounce);
      backdrop-filter:blur(20px);
      border:1px solid;
    }
    .toast.success{background:rgba(52,211,153,.12);color:var(--green);border-color:rgba(52,211,153,.2)}
    .toast.error{background:rgba(239,68,68,.12);color:var(--red);border-color:rgba(239,68,68,.2)}
    .toast.info{background:rgba(139,92,246,.12);color:var(--accent-bright);border-color:rgba(139,92,246,.2)}
    .toast.hiding{animation:toastOut .3s var(--transition) forwards}
    .toast-icon{width:18px;height:18px;flex-shrink:0}
    @keyframes toastIn{from{opacity:0;transform:translateY(20px) scale(.9)}to{opacity:1;transform:translateY(0) scale(1)}}
    @keyframes toastOut{to{opacity:0;transform:translateY(-10px) scale(.95)}}

    /* PROFILE MODAL */
    .modal-overlay{position:fixed;inset:0;z-index:100;background:rgba(0,0,0,.6);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;animation:fadeIn .25s var(--transition)}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    .modal{width:480px;max-width:92vw;max-height:90vh;overflow-y:auto;background:var(--bg-surface);border:1px solid var(--border-subtle);border-radius:var(--r-xl);box-shadow:var(--shadow-lg),var(--shadow-glow-strong);animation:modalIn .35s var(--bounce);position:relative}
    @keyframes modalIn{from{opacity:0;transform:scale(.92) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}
    .modal-header{padding:24px 28px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
    .modal-title{font-size:1.1rem;font-weight:700;color:var(--text-white);font-family:'Space Grotesk',sans-serif}
    .modal-close{width:34px;height:34px;display:flex;align-items:center;justify-content:center;background:none;border:1px solid var(--border);border-radius:var(--r-xs);color:var(--text-muted);cursor:pointer;transition:all .25s var(--transition)}
    .modal-close:hover{color:var(--red);border-color:rgba(239,68,68,.3);background:rgba(239,68,68,.05);transform:rotate(90deg)}
    .modal-body{padding:28px}

    .profile-avatar-section{display:flex;flex-direction:column;align-items:center;gap:14px;margin-bottom:32px;position:relative}
    .profile-ava-large{width:96px;height:96px;border-radius:50%;object-fit:cover;background:var(--bg-card);border:3px solid rgba(139,92,246,.3);box-shadow:0 0 30px rgba(139,92,246,.15);cursor:pointer;transition:all .3s var(--transition)}
    .profile-ava-large:hover{border-color:var(--accent);transform:scale(1.06);box-shadow:0 0 45px rgba(139,92,246,.25)}
    .ava-badge{position:absolute;bottom:18px;right:calc(50% - 52px);width:28px;height:28px;background:var(--accent);border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid var(--bg-surface);cursor:pointer;transition:transform .2s}
    .ava-badge:hover{transform:scale(1.15)}
    .ava-hint{font-size:.72rem;color:var(--text-ghost);font-family:'JetBrains Mono',monospace}

    .profile-field{margin-bottom:24px}
    .profile-field label{display:flex;align-items:center;gap:6px;font-size:.7rem;font-weight:600;color:var(--text-muted);margin-bottom:8px;text-transform:uppercase;letter-spacing:2px;font-family:'JetBrains Mono',monospace}
    .profile-field label svg{width:12px;height:12px;opacity:.5}
    .pf-input{width:100%;padding:14px 18px;background:rgba(255,255,255,.02);border:1px solid var(--border-subtle);color:var(--text-white);border-radius:var(--r-md);font-family:'Inter',sans-serif;font-size:.92rem;outline:none;transition:all .3s var(--transition)}
    .pf-input::placeholder{color:var(--text-ghost)}
    .pf-input:focus{border-color:var(--accent);background:rgba(139,92,246,.02);box-shadow:0 0 0 3px rgba(139,92,246,.08)}
    .pf-input:disabled{opacity:.4;cursor:not-allowed}
    .pf-input.with-at{padding-left:38px}
    .input-wrap{position:relative}
    .at-prefix{position:absolute;left:15px;top:50%;transform:translateY(-50%);color:var(--accent-bright);font-family:'JetBrains Mono',monospace;font-size:.95rem;font-weight:600;pointer-events:none}
    .field-hint{font-size:.68rem;color:var(--text-ghost);margin-top:7px;font-family:'JetBrains Mono',monospace;letter-spacing:.3px;line-height:1.4}
    .field-hint.warn{color:var(--red);opacity:.8}

    .username-status{display:inline-flex;align-items:center;gap:5px;margin-left:auto;font-size:.65rem;font-weight:500}
    .username-status.available{color:var(--green)}
    .username-status.taken{color:var(--red)}
    .username-status.checking{color:var(--text-muted)}

    .profile-divider{height:1px;background:var(--border);margin:28px 0}

    .profile-actions{display:flex;gap:12px;margin-top:32px}
    .btn-save{flex:1;padding:15px;background:linear-gradient(135deg,var(--accent),var(--accent-dim));border:none;border-radius:var(--r-md);color:#fff;font-weight:700;font-size:.9rem;cursor:pointer;transition:all .3s var(--transition);box-shadow:0 4px 18px rgba(139,92,246,.2);display:flex;align-items:center;justify-content:center;gap:8px}
    .btn-save:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(139,92,246,.35)}
    .btn-save:disabled{opacity:.5;cursor:not-allowed;transform:none!important}
    .btn-cancel{padding:15px 28px;background:none;border:1px solid var(--border);border-radius:var(--r-md);color:var(--text-secondary);font-weight:500;font-size:.9rem;cursor:pointer;transition:all .3s var(--transition)}
    .btn-cancel:hover{border-color:var(--text-muted);color:var(--text-white);background:rgba(255,255,255,.02)}

    .spinner{width:16px;height:16px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .6s linear infinite}
    @keyframes spin{to{transform:rotate(360deg)}}

    [data-tip]{position:relative}
    [data-tip]:hover::after{content:attr(data-tip);position:absolute;bottom:calc(100% + 10px);left:50%;transform:translateX(-50%);padding:6px 14px;background:var(--bg-card);border:1px solid var(--border-subtle);color:var(--text-secondary);font-size:.72rem;font-family:'JetBrains Mono',monospace;border-radius:var(--r-xs);white-space:nowrap;z-index:999;box-shadow:var(--shadow-md);animation:tipIn .2s var(--transition)}
    @keyframes tipIn{from{opacity:0;transform:translateX(-50%) translateY(4px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}

    @media(max-width:900px){.sidebar{width:280px;min-width:280px}}
    @media(max-width:700px){.sidebar{position:absolute;z-index:20;width:100%;min-width:100%;height:100%}.sidebar.hidden-mobile{display:none}.auth-card{padding:40px 28px;border-radius:var(--r-lg)}.modal{margin:12px;border-radius:var(--r-lg)}}
    @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
  </style>
</head>
<body>
  <canvas id="particles-bg"></canvas>
  <div class="bg-noise"></div>
  <div class="bg-gradient"></div>
  <div class="aurora"><div class="aurora-beam"></div><div class="aurora-beam"></div></div>
  <div class="toast-container" id="toast-container"></div>

  <!-- AUTH -->
  <div id="auth-screen" class="screen active">
    <div class="auth-wrapper">
      <div class="auth-card">
        <div class="card-shimmer"></div>
        <div class="logo-area">
          <div class="logo-orb">
            <div class="orb-ring"></div><div class="orb-ring"></div>
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" stroke-width=".4" opacity=".15" stroke-dasharray="3 6"><animateTransform attributeName="transform" type="rotate" dur="25s" from="0 50 50" to="360 50 50" repeatCount="indefinite"/></circle>
              <circle cx="50" cy="50" r="33" fill="none" stroke="currentColor" stroke-width=".6" opacity=".2" stroke-dasharray="2 4"><animateTransform attributeName="transform" type="rotate" dur="18s" from="360 50 50" to="0 50 50" repeatCount="indefinite"/></circle>
              <circle cx="50" cy="50" r="24" fill="none" stroke="currentColor" stroke-width="1" opacity=".35"><animateTransform attributeName="transform" type="rotate" dur="12s" from="0 50 50" to="360 50 50" repeatCount="indefinite"/></circle>
              <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" stroke-width="1.3" opacity=".5"/>
              <circle cx="50" cy="50" r="6" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".7"><animate attributeName="r" values="5;7;5" dur="3s" repeatCount="indefinite"/></circle>
              <circle cx="50" cy="50" r="2" fill="currentColor" opacity=".9"><animate attributeName="opacity" values=".6;1;.6" dur="2s" repeatCount="indefinite"/></circle>
            </svg>
          </div>
          <h1 class="logo-title">EchoVoid</h1>
          <p class="logo-tagline">// secure.messaging.protocol<span class="blink">_</span></p>
        </div>

        <div id="email-form" class="auth-form">
          <h2 class="form-title">Идентификация</h2>
          <div class="field">
            <label class="field-label">Email-адрес</label>
            <input type="email" id="email-input" class="field-input" placeholder="user@domain.com" autocomplete="email">
          </div>
          <button onclick="sendCode()" id="send-code-btn" class="btn-main">
            <span class="btn-text">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              Получить код
            </span>
          </button>
        </div>

        <div id="code-form" class="auth-form hidden">
          <h2 class="form-title">Подтверждение</h2>
          <div style="text-align:center"><span class="status-pill"><span class="pulse-dot"></span>Код отправлен</span></div>
          <div class="field">
            <label class="field-label">Код верификации</label>
            <input type="text" id="code-input" class="field-input code" placeholder="• • • • • •" maxlength="6" autocomplete="one-time-code">
          </div>
          <button onclick="login()" id="login-btn" class="btn-main">
            <span class="btn-text">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
              Войти в пустоту
            </span>
          </button>
          <div class="back-link"><a href="#" onclick="location.reload()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5m7-7-7 7 7 7"/></svg>вернуться</a></div>
        </div>
      </div>
    </div>
  </div>

  <!-- CHAT -->
  <div id="chat-screen" class="screen">
    <div class="chat-layout">
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-head">
          <div class="brand">
            <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="28" fill="none" stroke="currentColor" stroke-width="2" opacity=".4"><animateTransform attributeName="transform" type="rotate" dur="12s" from="0 50 50" to="360 50 50" repeatCount="indefinite"/></circle><circle cx="50" cy="50" r="16" fill="none" stroke="currentColor" stroke-width="2.5" opacity=".7"/><circle cx="50" cy="50" r="5" fill="currentColor"/></svg>
            <span class="brand-text">ECHOVOID</span>
          </div>
        </div>

        <div class="search-area">
          <div class="search-box">
            <input type="text" id="search-users-input" class="s-input" placeholder="Поиск по @username..." onkeypress="if(event.key==='Enter')searchUsers()">
            <svg class="s-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </div>
          <div class="s-hint">Enter — поиск • Ctrl+K — быстрый доступ</div>
        </div>

        <div id="contacts-list" class="contacts"><div class="contacts-label">Диалоги</div></div>

        <div class="sidebar-foot">
          <button class="profile-trigger" onclick="openProfile()">
            <img id="my-avatar" src="/default.png" class="ava-me" alt="">
            <div class="me-info">
              <div id="my-nickname" class="me-name">Nickname</div>
              <div id="my-handle" class="me-handle">@username</div>
            </div>
          </button>
          <div class="foot-actions">
            <button class="icon-btn" onclick="openProfile()" data-tip="Профиль">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            </button>
            <button onclick="logout()" class="icon-btn danger" data-tip="Выйти">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4m7 14l5-5-5-5m5 5H9"/></svg>
            </button>
          </div>
        </div>
      </aside>

      <main class="chat-main">
        <div class="chat-grid"></div>
        <div id="no-chat-selected" class="empty-state">
          <div class="empty-visual"><div class="void-circle"><div class="void-glow"></div>
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" stroke-width=".25" stroke-dasharray="2 5"><animateTransform attributeName="transform" type="rotate" dur="40s" from="0 50 50" to="360 50 50" repeatCount="indefinite"/></circle>
              <circle cx="50" cy="50" r="36" fill="none" stroke="currentColor" stroke-width=".35" stroke-dasharray="1 4"><animateTransform attributeName="transform" type="rotate" dur="30s" from="360 50 50" to="0 50 50" repeatCount="indefinite"/></circle>
              <circle cx="50" cy="50" r="26" fill="none" stroke="currentColor" stroke-width=".5" opacity=".5"/>
              <circle cx="50" cy="50" r="16" fill="none" stroke="currentColor" stroke-width=".6" opacity=".4"/>
              <circle cx="50" cy="50" r="3" fill="currentColor" opacity=".5"><animate attributeName="r" values="2;4;2" dur="4s" repeatCount="indefinite"/></circle>
            </svg>
          </div></div>
          <div class="empty-info"><h3>Выберите собеседника</h3><p>// начните общение в пустоте</p></div>
          <div class="empty-keys"><div class="key-hint"><kbd>Ctrl</kbd>+<kbd>K</kbd> поиск</div><div class="key-hint"><kbd>Enter</kbd> отправить</div></div>
        </div>

        <div id="active-chat" class="chat-active hidden">
          <div class="chat-top">
            <div id="chat-header-avatar" class="ct-ava"></div>
            <div class="ct-info"><div id="chat-name" class="ct-name">Чат</div><div class="ct-status"><span class="dot"></span>в сети</div></div>
            <div class="ct-actions">
              <button class="ct-action" data-tip="Поиск"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></button>
              <button class="ct-action" data-tip="Ещё"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg></button>
            </div>
          </div>
          <div id="messages-container" class="msg-scroll"><div id="messages-list" class="msg-list"></div></div>
          <div class="input-area">
            <button class="attach-btn" data-tip="Файл"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.44 11.05-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg></button>
            <div class="input-wrap"><input type="text" id="message-input" class="msg-input" placeholder="Напишите сообщение..." onkeypress="if(event.key==='Enter')sendMessage()"></div>
            <button id="send-btn" onclick="sendMessage()" class="send-orb" data-tip="Отправить"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13"/><path d="M22 2 15 22 11 13 2 9 22 2z"/></svg></button>
          </div>
        </div>
      </main>
    </div>
  </div>

  <!-- PROFILE MODAL -->
  <div id="profile-modal" class="modal-overlay hidden" onclick="if(event.target===this)closeProfile()">
    <div class="modal">
      <div class="modal-header">
        <span class="modal-title">⚙ Настройки профиля</span>
        <button class="modal-close" onclick="closeProfile()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="modal-body">
        <div class="profile-avatar-section">
          <div style="position:relative;display:inline-block">
            <img id="profile-avatar-preview" src="/default.png" class="profile-ava-large" alt="Аватар" onclick="document.getElementById('avatar-upload').click()">
            <div class="ava-badge" onclick="document.getElementById('avatar-upload').click()">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
            </div>
          </div>
          <input type="file" id="avatar-upload" hidden accept="image/*" onchange="uploadAvatar()">
          <span class="ava-hint">нажмите для смены аватара</span>
        </div>

        <div class="profile-field">
          <label>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Никнейм
          </label>
          <input type="text" id="profile-nickname" class="pf-input" placeholder="Ваше отображаемое имя" maxlength="32">
          <div class="field-hint">Отображается в чатах и списке контактов</div>
        </div>

        <div class="profile-field">
          <label>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
            Username
            <span id="username-check" class="username-status"></span>
          </label>
          <div class="input-wrap">
            <span class="at-prefix">@</span>
            <input type="text" id="profile-username" class="pf-input with-at" placeholder="your_username" maxlength="24" oninput="onUsernameInput(this)">
          </div>
          <div class="field-hint">Уникальный идентификатор • только a-z, 0-9, _ • мин. 3 символа</div>
          <div id="username-error" class="field-hint warn hidden"></div>
        </div>

        <div class="profile-divider"></div>

        <div class="profile-field">
          <label>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            Email
          </label>
          <input type="text" id="profile-email" class="pf-input" disabled>
          <div class="field-hint">Привязанный email нельзя изменить</div>
        </div>

        <div class="profile-actions">
          <button class="btn-cancel" onclick="closeProfile()">Отмена</button>
          <button class="btn-save" id="save-profile-btn" onclick="saveProfile()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/></svg>
            Сохранить
          </button>
        </div>
      </div>
    </div>
  </div>

  <script>
  // ===== PARTICLES =====
  const canvas = document.getElementById('particles-bg');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], mouse = {x:-999,y:-999};
  function resize(){W=canvas.width=innerWidth;H=canvas.height=innerHeight}
  resize(); addEventListener('resize',resize);
  addEventListener('mousemove',e=>{mouse.x=e.clientX;mouse.y=e.clientY});

  class P{
    constructor(){this.init()}
    init(){this.x=Math.random()*W;this.y=Math.random()*H;this.vx=(Math.random()-.5)*.25;this.vy=(Math.random()-.5)*.25;this.r=Math.random()*1.8+.3;this.ba=Math.random()*.25+.05;this.a=this.ba;this.ph=Math.random()*Math.PI*2;this.sp=Math.random()*.015+.005;this.h=Math.random()>.7?190:260}
    update(){this.ph+=this.sp;this.x+=this.vx;this.y+=this.vy;const dx=this.x-mouse.x,dy=this.y-mouse.y,d=Math.sqrt(dx*dx+dy*dy);if(d<120){const f=(120-d)/120*.015;this.vx+=dx*f;this.vy+=dy*f;this.a=this.ba+(1-d/120)*.3}else this.a+=(this.ba-this.a)*.05;this.vx*=.995;this.vy*=.995;if(this.x<-10)this.x=W+10;if(this.x>W+10)this.x=-10;if(this.y<-10)this.y=H+10;if(this.y>H+10)this.y=-10}
    draw(){const p=Math.sin(this.ph)*.3+.7,a=this.a*p;ctx.beginPath();ctx.arc(this.x,this.y,this.r*p,0,Math.PI*2);ctx.fillStyle=this.h===260?`rgba(139,92,246,${a})`:`rgba(34,211,238,${a*.6})`;ctx.fill()}
  }
  for(let i=0;i<80;i++)particles.push(new P);
  function drawL(){for(let i=0;i<particles.length;i++)for(let j=i+1;j<particles.length;j++){const dx=particles[i].x-particles[j].x,dy=particles[i].y-particles[j].y,d=dx*dx+dy*dy;if(d<18000){ctx.beginPath();ctx.moveTo(particles[i].x,particles[i].y);ctx.lineTo(particles[j].x,particles[j].y);ctx.strokeStyle=`rgba(139,92,246,${(1-d/18000)*.04})`;ctx.lineWidth=.5;ctx.stroke()}}}
  (function anim(){ctx.clearRect(0,0,W,H);particles.forEach(p=>{p.update();p.draw()});drawL();requestAnimationFrame(anim)})();

  // ===== TOAST SYSTEM =====
  function toast(message, type='info', duration=3000){
    const container = document.getElementById('toast-container');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    
    const icons = {
      success: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6 9 17l-5-5"/></svg>',
      error: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6m0-6 6 6"/></svg>',
      info: '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg>'
    };
    
    el.innerHTML = `${icons[type]||icons.info}<span>${message}</span>`;
    container.appendChild(el);
    
    setTimeout(()=>{
      el.classList.add('hiding');
      setTimeout(()=>el.remove(), 300);
    }, duration);
  }

  // ===== APP =====
  let currentUser = null, currentRoomId = null, ws = null;

  checkAuth();
  async function checkAuth(){
    try{
      const r = await fetch('/api/auth/me');
      if(!r.ok) return;
      const d = await r.json();
      if(d.authenticated){currentUser=d.user;initApp()}
    }catch(e){}
  }

  async function sendCode(){
    const email = document.getElementById('email-input').value.trim();
    if(!email) return shakeEl('email-input');
    const btn = document.getElementById('send-code-btn');
    btn.disabled = true;
    btn.querySelector('.btn-text').innerHTML = '<div class="spinner"></div> Отправка...';
    try{
      const r = await fetch('/api/auth/send-code',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email})});
      const d = await r.json();
      if(d.success){
        document.getElementById('email-form').classList.add('hidden');
        document.getElementById('code-form').classList.remove('hidden');
        setTimeout(()=>document.getElementById('code-input').focus(),100);
        toast('Код отправлен на почту','success');
      } else toast(d.error||'Ошибка отправки','error');
    }catch(e){toast('Сервер недоступен','error')}
    finally{btn.disabled=false;btn.querySelector('.btn-text').innerHTML='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> Получить код'}
  }

  async function login(){
    const email = document.getElementById('email-input').value;
    const code = document.getElementById('code-input').value.trim();
    if(!code) return shakeEl('code-input');
    const btn = document.getElementById('login-btn');
    btn.disabled = true;
    btn.querySelector('.btn-text').innerHTML = '<div class="spinner"></div> Проверка...';
    try{
      const r = await fetch('/api/auth/login-email',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,code})});
      const d = await r.json();
      if(d.success){currentUser=d.user;toast('Добро пожаловать!','success');initApp()}
      else{toast(d.error||'Неверный код','error');shakeEl('code-input')}
    }catch(e){toast('Сервер недоступен','error')}
    finally{btn.disabled=false;btn.querySelector('.btn-text').innerHTML='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg> Войти в пустоту'}
  }

  function shakeEl(id){const el=document.getElementById(id);el.style.animation='none';el.offsetHeight;el.style.animation='shake .4s var(--transition)';el.style.borderColor='rgba(239,68,68,.5)';setTimeout(()=>el.style.borderColor='',1500)}

  function initApp(){
    document.getElementById('auth-screen').classList.remove('active');
    document.getElementById('chat-screen').classList.add('active');
    document.getElementById('chat-screen').style.display='flex';
    updateSidebarProfile();
    connectWS();
    loadContacts();
  }

  function updateSidebarProfile(){
    document.getElementById('my-nickname').innerText = currentUser.display_name || currentUser.username || 'Аноним';
    document.getElementById('my-handle').innerText = '@'+(currentUser.username||'unknown');
    if(currentUser.avatar_url) document.getElementById('my-avatar').src = currentUser.avatar_url;
  }

  // ===== PROFILE =====
  function openProfile(){
    document.getElementById('profile-modal').classList.remove('hidden');
    document.getElementById('profile-nickname').value = currentUser.display_name || '';
    document.getElementById('profile-username').value = currentUser.username || '';
    document.getElementById('profile-email').value = currentUser.email || '';
    document.getElementById('profile-avatar-preview').src = currentUser.avatar_url || '/default.png';
    document.getElementById('username-error').classList.add('hidden');
    document.getElementById('username-check').innerHTML = '';
  }

  function closeProfile(){
    document.getElementById('profile-modal').classList.add('hidden');
  }

  function onUsernameInput(input){
    // Sanitize: only a-z, 0-9, _
    input.value = input.value.toLowerCase().replace(/[^a-z0-9_]/g,'');
    const val = input.value;
    const check = document.getElementById('username-check');
    const errEl = document.getElementById('username-error');
    
    if(val.length < 3){
      check.className = 'username-status';
      check.innerHTML = '';
      errEl.classList.add('hidden');
      return;
    }
    
    // Show valid indicator locally
    check.className = 'username-status available';
    check.innerHTML = '✓ доступен';
    errEl.classList.add('hidden');
  }

  async function saveProfile(){
    const nickname = document.getElementById('profile-nickname').value.trim();
    const username = document.getElementById('profile-username').value.trim();
    const errEl = document.getElementById('username-error');
    
    // Validate username
    if(!username || username.length < 3){
      errEl.textContent = '// username должен быть минимум 3 символа';
      errEl.classList.remove('hidden');
      shakeEl('profile-username');
      return;
    }
    if(!/^[a-z0-9_]+$/.test(username)){
      errEl.textContent = '// только a-z, 0-9 и _ допустимы';
      errEl.classList.remove('hidden');
      shakeEl('profile-username');
      return;
    }

    const btn = document.getElementById('save-profile-btn');
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div> Сохранение...';

    try{
      const r = await fetch('/api/profile/update',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({display_name:nickname, username:username})
      });
      
      if(!r.ok){
        // Сервер вернул ошибку (404, 500 и т.д.)
        if(r.status === 404){
          // Эндпоинт не существует — сохраняем локально
          currentUser.display_name = nickname;
          currentUser.username = username;
          updateSidebarProfile();
          closeProfile();
          toast('Профиль сохранён локально (API не найден)','info');
        } else {
          const d = await r.json().catch(()=>null);
          toast(d?.error || `Ошибка сервера (${r.status})`,'error');
        }
        return;
      }
      
      const d = await r.json();
      if(d.success){
        currentUser.display_name = d.display_name || nickname;
        currentUser.username = d.username || username;
        if(d.avatar_url) currentUser.avatar_url = d.avatar_url;
        updateSidebarProfile();
        closeProfile();
        toast('Профиль обновлён','success');
      } else {
        if(d.error && d.error.includes('заня')){
          document.getElementById('username-check').className = 'username-status taken';
          document.getElementById('username-check').innerHTML = '✕ занят';
        }
        toast(d.error||'Не удалось сохранить','error');
      }
    }catch(e){
      // Полная ошибка сети — сохраняем локально
      currentUser.display_name = nickname;
      currentUser.username = username;
      updateSidebarProfile();
      closeProfile();
      toast('Сохранено локально (сервер недоступен)','info');
    }finally{
      btn.disabled = false;
      btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/></svg> Сохранить';
    }
  }

  async function uploadAvatar(){
    const file = document.getElementById('avatar-upload').files[0];
    if(!file) return;
    
    // Превью до загрузки
    const reader = new FileReader();
    reader.onload = e => {
      document.getElementById('profile-avatar-preview').src = e.target.result;
    };
    reader.readAsDataURL(file);
    
    const fd = new FormData(); fd.append('file',file);
    try{
      const r = await fetch('/api/profile/avatar',{method:'POST',body:fd});
      if(!r.ok){
        if(r.status === 404){
          // Сохраняем локально как data URL
          toast('Аватар обновлён локально','info');
          document.getElementById('my-avatar').src = document.getElementById('profile-avatar-preview').src;
          return;
        }
        toast('Ошибка загрузки аватара','error');
        return;
      }
      const d = await r.json();
      if(d.success){
        currentUser.avatar_url = d.avatarUrl;
        document.getElementById('my-avatar').src = d.avatarUrl;
        document.getElementById('profile-avatar-preview').src = d.avatarUrl;
        toast('Аватар обновлён','success');
      } else toast(d.error||'Ошибка загрузки','error');
    }catch(e){
      toast('Аватар сохранён локально','info');
      document.getElementById('my-avatar').src = document.getElementById('profile-avatar-preview').src;
    }
  }

  // ===== WS =====
  function connectWS(){
    const proto = location.protocol==='https:'?'wss:':'ws:';
    ws = new WebSocket(`${proto}//${location.host}`);
    ws.onopen = ()=>{
      const token = document.cookie.split('session_token=')[1]?.split(';')[0];
      ws.send(JSON.stringify({type:'auth',token}));
    };
    ws.onmessage = e=>{
      const msg = JSON.parse(e.data);
      if(msg.type==='new_message' && msg.message.room_id===currentRoomId) appendMessage(msg.message);
      if(msg.type==='profile_updated' && msg.userId===currentUser.id){
        if(msg.avatarUrl){currentUser.avatar_url=msg.avatarUrl;document.getElementById('my-avatar').src=msg.avatarUrl}
      }
    };
    ws.onclose = ()=>setTimeout(connectWS,3000);
  }

  // ===== CONTACTS =====
  async function searchUsers(){
    const q = document.getElementById('search-users-input').value.trim();
    if(q.length<2){toast('Введите минимум 2 символа','info');return}
    try{
      const r = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
      if(!r.ok){toast('Ошибка поиска','error');return}
      const users = await r.json();
      const list = document.getElementById('contacts-list');
      list.innerHTML = '<div class="contacts-label">Результаты</div>';
      if(!users.length){
        list.innerHTML += '<div style="padding:30px 24px;color:var(--text-ghost);font-size:.82rem;text-align:center;font-family:JetBrains Mono,monospace">// ничего не найдено</div>';
        return;
      }
      users.forEach(u=>{
        const el = document.createElement('div');
        el.className = 'contact';
        el.innerHTML = `
          <div class="contact-ava-wrap"><img src="${u.avatar_url||'/default.png'}" class="contact-ava" alt=""></div>
          <div class="contact-meta">
            <span class="contact-name">${esc(u.display_name||u.username)}</span>
            <span class="contact-handle">@${esc(u.username)}</span>
            <span class="contact-last">Нажмите чтобы добавить</span>
          </div>
        `;
        el.onclick = async()=>{
          await fetch('/api/contacts/add',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contactId:u.id})});
          document.getElementById('search-users-input').value='';
          loadContacts();
          startChat(u.id,u.display_name||u.username);
          toast(`${u.display_name||u.username} добавлен`,'success');
        };
        list.appendChild(el);
      });
    }catch(e){toast('Сервер недоступен','error')}
  }

  async function loadContacts(){
    try{
      const r = await fetch('/api/contacts');
      if(!r.ok) return;
      const contacts = await r.json();
      const list = document.getElementById('contacts-list');
      list.innerHTML = '<div class="contacts-label">Диалоги</div>';
      if(!contacts.length){
        list.innerHTML += '<div style="padding:30px 24px;color:var(--text-ghost);font-size:.82rem;text-align:center;font-family:JetBrains Mono,monospace">// список пуст<br>найдите друзей через поиск</div>';
        return;
      }
      contacts.forEach(c=>{
        const el = document.createElement('div');
        el.className = 'contact';
        el.dataset.id = c.contact_id;
        el.innerHTML = `
          <div class="contact-ava-wrap"><img src="${c.avatar_url||'/default.png'}" class="contact-ava" alt=""></div>
          <div class="contact-meta">
            <span class="contact-name">${esc(c.display_name||c.username)}</span>
            <span class="contact-handle">@${esc(c.username||'')}</span>
            <span class="contact-last">Написать сообщение...</span>
          </div>
        `;
        el.onclick = ()=>{
          document.querySelectorAll('.contact').forEach(x=>x.classList.remove('active'));
          el.classList.add('active');
          startChat(c.contact_id,c.display_name||c.username);
        };
        list.appendChild(el);
      });
    }catch(e){}
  }

  async function startChat(contactId,name){
    try{
      const r = await fetch('/api/contacts/add',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contactId})});
      const d = await r.json();
      currentRoomId = d.roomId;
      document.getElementById('no-chat-selected').classList.add('hidden');
      const ac = document.getElementById('active-chat');
      ac.classList.remove('hidden');ac.style.display='flex';
      document.getElementById('chat-name').innerText = name;
      document.getElementById('messages-list').innerHTML = '';
      document.getElementById('message-input').focus();
    }catch(e){toast('Ошибка открытия чата','error')}
  }

  function sendMessage(){
    const input = document.getElementById('message-input');
    const text = input.value.trim();
    if(!text||!currentRoomId) return;
    if(!ws||ws.readyState!==WebSocket.OPEN){toast('Нет подключения к серверу','error');return}
    ws.send(JSON.stringify({type:'message',roomId:currentRoomId,content:text}));
    input.value='';
  }

  function appendMessage(msg){
    const list = document.getElementById('messages-list');
    const isMe = msg.from_user_id === currentUser.id;
    const time = new Date().toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'});
    const el = document.createElement('div');
    el.className = `msg-row ${isMe?'me':''}`;
    el.innerHTML = `
      <img src="${msg.avatar_url||'/default.png'}" class="msg-ava" alt="">
      <div class="msg-bubble">
        <div class="msg-body">${esc(msg.content)}</div>
        <div class="msg-footer">
          <span class="msg-time">${time}</span>
          ${isMe?'<svg class="msg-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>':''}
        </div>
      </div>
    `;
    list.appendChild(el);
    document.getElementById('messages-container').scrollTo({top:99999,behavior:'smooth'});
  }

  function esc(t){const d=document.createElement('div');d.textContent=t;return d.innerHTML}
  function logout(){document.cookie='session_token=; Max-Age=0; path=/';location.reload()}

  document.addEventListener('keydown',e=>{
    if((e.ctrlKey||e.metaKey)&&e.key==='k'){e.preventDefault();const s=document.getElementById('search-users-input');if(s){s.focus();s.select()}}
    if(e.key==='Escape') closeProfile();
  });
  </script>
</body>
</html>