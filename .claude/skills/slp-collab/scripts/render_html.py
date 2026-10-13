#!/usr/bin/env python3
"""Render the single-file HTML overview from tasks.json.

Single-file, zero CDN, inline CSS + JS, stdlib only.
Same atomic .tmp + mv contract as render_dashboard (caller handles it).

Reads env: DB_PATH, REGISTRY_PATH, DEC_DIR, WS_NAME.
Writes the full HTML document to stdout.
"""
import html
import json
import os
from datetime import datetime, timedelta, timezone

PRI_ORDER = {"critical": 0, "high": 1, "normal": 2, "low": 3}
PRI_SHORT = {"critical": "cri", "high": "hig", "normal": "nor", "low": "low"}


def vn(iso):
    if not iso:
        return ""
    try:
        dt = datetime.fromisoformat(iso.replace("Z", "+00:00"))
        dt = dt.astimezone(timezone.utc) + timedelta(hours=7)
        return dt.strftime("%d/%m %H:%M")
    except Exception:
        return "?"


def esc(x):
    return html.escape("" if x is None else str(x), quote=True)


def main():
    with open(os.environ["DB_PATH"]) as f:
        db = json.load(f)
    with open(os.environ["REGISTRY_PATH"]) as f:
        reg = json.load(f)
    dec_dir = os.environ.get("DEC_DIR", "")
    peers = sorted(reg.get("peers", {}).keys())
    tasks = db.get("tasks", {})
    events = db.get("events", [])[-20:][::-1]
    decisions = sorted(
        f for f in (os.listdir(dec_dir) if dec_dir and os.path.isdir(dec_dir) else [])
        if f.endswith(".md")
    )
    updated = vn(db.get("updated_at", ""))
    ws = os.environ.get("WS_NAME", "")

    rows = []
    for tid in sorted(tasks):
        x = tasks[tid]
        due = x.get("due_at") or ""
        over = False
        if due and x.get("status") in ("upcoming", "pending", "working", "blocked", "dispatched"):
            try:
                over = datetime.fromisoformat(due.replace("Z", "+00:00")) < datetime.now(timezone.utc)
            except Exception:
                over = False
        pri = x.get("priority") or "normal"
        if pri not in PRI_ORDER:
            pri = "normal"
        rows.append({
            "id": tid, "title": x.get("title", ""), "peer": x.get("peer", ""),
            "status": x.get("status", ""), "priority": pri, "due": due,
            "due_vn": vn(due), "over": over, "tags": x.get("tags", []) or [],
            "verdict": x.get("verdict") or "",
        })

    cols = ["upcoming", "working", "blocked", "done"]

    def col_of(r):
        s = r["status"]
        if s in ("pending", "dispatched"):
            return "working"
        return s if s in cols else "done"

    kanban = {c: [r for r in rows if col_of(r) == c] for c in cols}
    stats = {c: len(kanban[c]) for c in cols}
    statuses = sorted({r["status"] for r in rows})
    matrix = {
        peer: {s: sum(1 for r in rows if r["peer"] == peer and r["status"] == s)
               for s in statuses}
        for peer in peers
    }
    ev = [{
        "seq": e.get("seq", ""), "at": vn(e.get("at", "")), "type": e.get("type", ""),
        "task": e.get("task_id", ""), "actor": e.get("actor", ""),
        "detail": e.get("verdict") or e.get("status") or e.get("path") or e.get("lock") or "",
    } for e in events]

    def card(r):
        tags = " ".join(f'<span class="tag">{esc(x)}</span>' for x in r["tags"])
        due = (f'<span class="due{" over" if r["over"] else ""}">&#9200; {esc(r["due_vn"])}</span>'
               if r["due"] else "")
        extra = f'<span class="verdict">{esc(r["verdict"])}</span>' if r["verdict"] else ""
        st = {"pending": "working", "dispatched": "working"}.get(r["status"], r["status"])
        return (
            f'<div class="card p-{PRI_SHORT[r["priority"]]} s-{st}" data-id="{esc(r["id"])}"'
            f' data-peer="{esc(r["peer"])}" data-status="{esc(r["status"])}" '
            f'data-tags="{esc(" ".join(r["tags"]))}" data-title="{esc(r["title"].lower())}">'
            f'<div class="cid">#{esc(r["id"])} <span class="ppri">{PRI_SHORT[r["priority"]].upper()}</span>{due}</div>'
            f'<div class="ct">{esc(r["title"])}</div>'
            f'<div class="cm"><span class="peer">{esc(r["peer"])}</span>{extra}{tags}</div></div>'
        )

    def done_card(r):
        tags = " ".join(
            f'<span class="tag">{esc(x)}</span>' for x in r["tags"] if x != "imported"
        )
        due = (f'<span class="due{" over" if r["over"] else ""}">&#9200; {esc(r["due_vn"])}</span>'
               if r["due"] else "")
        return (
            f'<div class="card p-{PRI_SHORT[r["priority"]]} s-done" data-id="{esc(r["id"])}"'
            f' data-peer="{esc(r["peer"])}" data-status="{esc(r["status"])}" '
            f'data-tags="{esc(" ".join(r["tags"]))}" data-title="{esc(r["title"].lower())}">'
            f'<div class="cid cid-agent"><span>#{esc(r["id"])} <span class="ppri">{PRI_SHORT[r["priority"]].upper()}</span>{due}</span>'
            f'<span class="peer">{esc(r["peer"])}</span></div>'
            f'<div class="ct">{esc(r["title"])}</div>'
            + (f'<div class="cm">{tags}</div>' if tags else '')
            + '</div>'
        )

    def done_groups(items):
        by_peer = {}
        for r in items:
            by_peer.setdefault(r["peer"], []).append(r)
        out = []
        for peer in sorted(by_peer):
            members = sorted(by_peer[peer], key=lambda r: r["id"])
            out.append(
                f'<details class="dgroup s-done" open>'
                f'<summary><span class="peer">{esc(peer)}</span>'
                f'<span class="gn">{len(members)}</span></summary>'
                f'<div class="dcards">{"".join(done_card(r) for r in members)}</div>'
                f'</details>'
            )
        return "".join(out)

    kanban_html = "".join(
        f'<section class="col" data-col="{c}"><h2>{c.title()} <span class="n">{stats[c]}</span></h2>'
        + (done_groups(kanban[c]) if c == "done" else "".join(card(r) for r in kanban[c]))
        + "</section>"
        for c in cols
    )
    mhead = "".join(f"<th>{esc(s)}</th>" for s in statuses)
    mrows = "".join(
        "<tr><th>" + esc(peer) + "</th>" + "".join(
            f'<td data-cell="{esc(peer)}|{esc(s)}"'
            f' class="{"hot" if matrix[peer][s] else "cell-empty"}">'
            f'{matrix[peer][s] or "&middot;"}</td>'
            for s in statuses
        ) + "</tr>"
        for peer in peers
    )
    trows = "".join(
        f'<tr data-id="{esc(r["id"])}" data-peer="{esc(r["peer"])}" '
        f'data-status="{esc(r["status"])}" data-tags="{esc(" ".join(r["tags"]))}" '
        f'data-title="{esc(r["title"].lower())}">'
        f"<td>#{esc(r['id'])}</td><td>{esc(r['title'])}</td><td>{esc(r['peer'])}</td>"
        f'<td><span class="st st-{esc(r["status"])}">{esc(r["status"])}</span></td>'
        f'<td><span class="ppri p-{PRI_SHORT[r["priority"]]}">{esc(r["priority"])}</span></td>'
        f"<td>{esc(r['due_vn'])}{' ⚠' if r['over'] else ''}</td>"
        f"<td>{esc(r['verdict'])}</td></tr>"
        for r in rows
    )
    erows = "".join(
        f"<tr><td>{esc(e['seq'])}</td><td>{esc(e['at'])}</td><td>{esc(e['type'])}</td>"
        f"<td>{esc(e['task'])}</td><td>{esc(e['actor'])}</td><td>{esc(e['detail'])}</td></tr>"
        for e in ev
    )
    dlist = "".join(f'<li><a href="../_decisions/{esc(d)}">{esc(d)}</a></li>' for d in decisions)

    css = (":root{--bg:#eef1f6;--panel:#ffffff;--line:#c9d3e0;--tx:#0f1722;--dim:#48586c;--c-cri:#e11d48;--c-hig:#ea580c;--c-nor:#059669;--c-low:#64748b;--s-upcoming:#b45309;--s-working:#1d4ed8;--s-blocked:#dc2626;--s-done:#059669;--s-upcoming-bg:#fef08a;--s-working-bg:#bfdbfe;--s-blocked-bg:#fecaca;--s-done:#047857;--line-soft:#e6ebf2;}*{box-sizing:border-box}body{margin:0 auto;background:var(--bg);color:var(--tx);font:14px/1.5 system-ui,-apple-system,'Segoe UI',sans-serif;padding:20px;max-width:1400px}h1{font-size:22px;margin:0 0 4px}.sub{color:var(--dim);margin:0 0 16px}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px}.stat{background:var(--panel);border:2px solid var(--line);border-radius:2px;padding:12px 16px}.stat:nth-child(1){border-top:6px solid var(--s-upcoming)}.stat:nth-child(2){border-top:6px solid var(--s-working)}.stat:nth-child(3){border-top:6px solid var(--s-blocked)}.stat:nth-child(4){border-top:6px solid var(--s-done)}.stat b{font-size:26px;display:block}.stat span{color:var(--dim);font-size:12px;text-transform:uppercase}.filters{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px}input,select{background:var(--panel);color:var(--tx);border:2px solid var(--line);border-radius:2px;padding:8px 10px;font-size:14px}input{flex:1;min-width:180px}.kanban{display:grid;grid-template-columns:repeat(4,minmax(240px,1fr));gap:12px;overflow-x:auto;margin-bottom:20px}.col{background:var(--panel);border:2px solid var(--line);border-radius:2px;padding:10px;min-height:120px}.col[data-col=upcoming]{border-top:6px solid var(--s-upcoming)}.col[data-col=working]{border-top:6px solid var(--s-working)}.col[data-col=blocked]{border-top:6px solid var(--s-blocked)}.col[data-col=done]{border-top:6px solid var(--s-done)}.col h2{font-size:13px;text-transform:uppercase;color:var(--tx);margin:0 0 8px}.col h2 .n{background:var(--tx);border-radius:2px;padding:0 8px;color:#fff}.card{background:var(--panel);border:2px solid var(--line);border-left:8px solid var(--c-nor);border-radius:2px;padding:8px 10px;margin-bottom:8px;box-shadow:0 2px 6px rgba(16,24,40,.15)}.card.p-cri{border-left-color:var(--c-cri)}.card.p-hig{border-left-color:var(--c-hig)}.card.p-low{border-left-color:var(--c-low)}.card.s-upcoming{background:var(--s-upcoming-bg);border-color:var(--s-upcoming)}.card.s-working{background:var(--s-working-bg);border-color:var(--s-working)}.card.s-blocked{background:var(--s-blocked-bg);border-color:var(--s-blocked)}.card.s-done{background:#fff;border-color:#d6dde7}.card.s-done:hover{background:#f9fbff}.cid{font-size:11px;color:var(--dim)}.ppri{font-weight:800;font-size:12px}.p-cri .ppri{color:var(--c-cri)}.p-hig .ppri{color:var(--c-hig)}.p-nor .ppri{color:var(--c-nor)}.p-low .ppri{color:var(--c-low)}.ct{font-weight:700;margin:2px 0 4px;font-size:14px}.cm{font-size:12px;display:flex;gap:6px;flex-wrap:wrap;align-items:center}.peer{font-weight:800;border-radius:2px;padding:2px 10px;background:var(--c-nor);color:#fff;border:2px solid var(--c-nor)}.s-upcoming .peer{background:var(--s-upcoming);border-color:var(--s-upcoming)}.s-working .peer{background:var(--s-working);border-color:var(--s-working)}.s-blocked .peer{background:var(--s-blocked);border-color:var(--s-blocked)}.s-done .peer{background:var(--s-done);border-color:var(--s-done)}.st{font-weight:800;border-radius:2px;padding:2px 10px;font-size:12px;background:#e4e9f0;color:#344054}.st-working{background:var(--s-working);color:#fff}.st-blocked{background:var(--s-blocked);color:#fff}.st-done{background:var(--s-done);color:#fff}.st-upcoming{background:var(--s-upcoming);color:#fff}.st-pending{background:#344054;color:#fff}table{width:100%;border-collapse:collapse;background:var(--panel);border:2px solid var(--line);border-radius:2px;overflow:hidden;margin-bottom:20px}th,td{padding:8px 10px;border:1px solid var(--line);text-align:left;font-size:13px}th{background:#dbe4ef;color:#1f2d3d;text-transform:uppercase;font-size:11px;letter-spacing:.04em}tbody tr:nth-child(even){background:#f7fafc}td.hot{background:#dbeafe;font-weight:800;cursor:pointer;color:#1d4ed8}td.cell-empty{color:#a5b1bf;background:repeating-linear-gradient(45deg,#f7f9fc,#f7f9fc 5px,#edf1f6 5px,#edf1f6 10px);text-align:center}.live{background:#067647;color:#fff;border-radius:2px;padding:1px 8px;font-size:12px;font-weight:700}.live.stale{background:#b42318;animation:blink 1s steps(2) infinite}@keyframes blink{50%{opacity:.35}}.peer-badge{font-size:10px;font-weight:600;color:#475569;background:#f1f5f9;border:1px solid #d6dde7;border-radius:8px;padding:0 6px;line-height:16px;max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dgroup{background:#eef2f7;border:1px solid var(--line);border-left:4px solid #94a3b8;border-radius:3px;margin-bottom:8px;overflow:hidden}.dgroup>summary{cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center;padding:7px 10px;font-size:13px;color:var(--tx);background:#fff;border-bottom:1px solid var(--line)}.dgroup>summary:hover{background:#eef2f7}.dgroup>summary::-webkit-details-marker{display:none}.dgroup .dcards{padding:0 6px 2px}.dgroup .dcards .card:last-child{margin-bottom:6px}.cid-agent{display:flex;justify-content:space-between;align-items:center;gap:8px}.gn{background:#fff;border:1px solid var(--line);color:var(--dim);border-radius:8px;padding:0 8px;font-size:11px;font-weight:700}\n\n/* Kanban Pro — pure UI override, no data/markup changes */\nbody{padding:24px;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}\nh1{font-size:24px;font-weight:800;letter-spacing:-.02em}\n.sub{font-size:13px;margin:4px 0 18px}\n/* stats */\n.stats{gap:16px}\n.stat{background:#fff;border:1px solid #e2e8f0!important;border-radius:12px!important;padding:14px 16px!important;box-shadow:0 1px 2px rgba(16,24,40,.06);position:relative;overflow:hidden}\n.stat::before{content:\"\";position:absolute;top:0;left:0;right:0;height:3px;background:#cbd5e1}\n.stat:nth-child(1)::before{background:#d97706}.stat:nth-child(2)::before{background:#2563eb}.stat:nth-child(3)::before{background:#dc2626}.stat:nth-child(4)::before{background:#059669}\n.stat:nth-child(1),.stat:nth-child(2),.stat:nth-child(3),.stat:nth-child(4){border-top:1px solid #e2e8f0!important}\n.stat b{font-size:28px;font-weight:800;letter-spacing:-.02em}\n/* filters */\n.filters input,.filters select{border:1px solid #cbd5e1!important;border-radius:8px!important;box-shadow:0 1px 2px rgba(16,24,40,.05);outline:none}\n.filters input:focus,.filters select:focus{border-color:#2563eb!important;box-shadow:0 0 0 3px rgba(37,99,235,.15)}\n/* section titles */\nh2{font-size:12px!important;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#475569!important;margin:22px 0 10px!important}\n/* kanban layout */\n.kanban{gap:16px!important;align-items:start;padding-bottom:8px}\n.kanban::-webkit-scrollbar{height:8px}\n.kanban::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:999px}\n.col{background:#f8fafc!important;border:1px solid #e2e8f0!important;border-radius:14px!important;padding:12px!important;min-height:220px;max-height:72vh;overflow-y:auto;box-shadow:inset 0 1px 0 #fff}\n.col[data-col=upcoming]{border-top:3px solid #d97706!important}\n.col[data-col=working]{border-top:3px solid #2563eb!important}\n.col[data-col=blocked]{border-top:3px solid #dc2626!important}\n.col[data-col=done]{border-top:3px solid #059669!important}\n.col h2{position:sticky;top:-12px;z-index:2;background:#f8fafc;padding:6px 2px!important;margin:0 0 10px!important;display:flex;justify-content:space-between;align-items:center}\n.col h2 .n{background:#e2e8f0!important;color:#475569!important;font-size:12px;font-weight:800;min-width:26px;text-align:center;border-radius:999px!important;padding:1px 8px!important}\n/* peer groups */\n.dgroup{background:transparent!important;border:none!important;margin-bottom:10px!important;overflow:visible!important}\n.dgroup>summary{background:#fff!important;border:1px solid #e2e8f0!important;border-radius:8px!important;padding:6px 8px!important;box-shadow:0 1px 2px rgba(16,24,40,.05);font-weight:700}\n.dgroup>summary:hover{background:#f8fafc!important}\n.dgroup .dcards{padding:8px 2px 2px!important}\n.gn{background:#f1f5f9!important;border:1px solid #e2e8f0!important;color:#64748b!important;border-radius:999px!important}\n/* cards */\n.card{background:#fff!important;border:1px solid #e2e8f0!important;border-left-width:4px!important;border-radius:10px!important;padding:10px 12px!important;margin-bottom:8px!important;box-shadow:0 1px 2px rgba(16,24,40,.06)!important;transition:transform .12s ease,box-shadow .12s ease,border-color .12s ease}\n.card:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(16,24,40,.1)!important;border-color:#cbd5e1!important}\n.card.s-upcoming,.card.s-working,.card.s-blocked,.card.s-done{background:#fff!important;border-color:#e2e8f0!important}\n.card.s-working{border-color:#bfdbfe!important}\n.card.s-blocked{border-color:#fecaca!important}\n.card.p-cri{border-left-color:#e11d48!important}\n.card.p-hig{border-left-color:#ea580c!important}\n.card.p-nor{border-left-color:#059669!important}\n.card.p-low{border-left-color:#94a3b8!important}\n.cid{font-size:11px!important;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#94a3b8!important}\n.ppri{font-size:11px!important;letter-spacing:.05em}\n.ct{font-size:13.5px!important;font-weight:600!important;line-height:1.45;color:#0f172a}\n.peer{font-size:11px!important;font-weight:700!important;letter-spacing:.02em;border-radius:999px!important;padding:2px 9px!important;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n/* empty column hint — no JS change, pure :has */\n.col:not(:has(.card:not([style*=\"none\"]))):after{content:\"No tasks\";display:block;border:1px dashed #cbd5e1;border-radius:10px;padding:18px 10px;text-align:center;font-size:12px;font-weight:600;color:#94a3b8;background:#fff;margin-top:4px}\n@media(max-width:1024px){.stats{grid-template-columns:repeat(2,1fr)}.kanban{grid-template-columns:repeat(2,minmax(240px,1fr))}}\n@media(max-width:640px){body{padding:16px}.kanban{grid-template-columns:1fr}.col{max-height:none}}\n@media(prefers-reduced-motion:reduce){.card{transition:none}.card:hover{transform:none}}\n/* square — no rounded corners */\n.stat,.stat::before,.filters input,.filters select,.col,.col h2 .n,.dgroup>summary,.gn,.card,.peer,.col:not(:has(.card:not([style*=\"none\"]))):after{border-radius:0!important}\n/* group cleanup — header keeps peer, card drops repeated peer */\n.dgroup>summary{gap:8px}\n.dgroup>summary .peer{background:transparent!important;border:none!important;color:#0f172a!important;padding:0!important;font-size:12px!important;font-weight:800!important;letter-spacing:.06em;text-transform:uppercase;max-width:none;box-shadow:none!important}\n.dgroup .dcards .card .peer{display:none!important}\n.dgroup .dcards .card .cid-agent{justify-content:flex-start!important}\n.dgroup .gn{margin-left:auto}\n/* hide NOR/priority badge on kanban cards — data kept */\n.card .ppri{display:none!important}\n/* group border — square container */\n.dgroup{background:#fff!important;border:1px solid #cbd5e1!important}\n.dgroup>summary{border:none!important;border-bottom:1px solid #e2e8f0!important}\n/* header group solid + white text */\n.dgroup.s-upcoming>summary{background:#b45309!important}\n.dgroup.s-working>summary{background:#1d4ed8!important}\n.dgroup.s-blocked>summary{background:#dc2626!important}\n.dgroup.s-done>summary{background:#047857!important}\n.dgroup>summary{color:#fff!important}\n.dgroup>summary .peer{color:#fff!important}\n.dgroup>summary .gn{background:rgba(255,255,255,.2)!important;border-color:rgba(255,255,255,.5)!important;color:#fff!important}\n/* count boxes: white bg, black text */\n.col h2 .n{background:#fff!important;color:#000!important;border:1px solid #94a3b8!important}\n.dgroup>summary .gn{background:#fff!important;border-color:#fff!important;color:#000!important}\n\n.more{border:1px dashed #cbd5e1;border-radius:0!important;padding:6px 10px;text-align:center;font-size:12px;font-weight:700;color:#64748b;background:#f8fafc;margin:0 2px 6px}\n#pager,#pager-ev{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:0 0 20px;font-size:13px;color:#475569}\n#pager button,#pager-ev button{background:#fff;border:1px solid #cbd5e1;border-radius:0!important;padding:4px 10px;font-size:13px;font-weight:700;color:#0f172a;cursor:pointer}\n#pager button:hover:not(:disabled),#pager-ev button:hover:not(:disabled){border-color:#2563eb;color:#2563eb}\n#pager button:disabled,#pager-ev button:disabled{opacity:.4;cursor:default}\n#pager button.cur,#pager-ev button.cur{background:#0f172a;border-color:#0f172a;color:#fff}\n#pager .pinfo,#pager-ev .pinfo{margin-left:auto;font-size:12px;color:#64748b}")
    js = ("const D=JSON.parse(document.getElementById('data').textContent);\n"
          "const $=id=>document.getElementById(id);\n"
          "function cur(){const h={};location.hash.slice(1).split('&').forEach(p=>{const[a,b]=p.split('=');if(a)h[a]=decodeURIComponent(b||'')});return h}\n"
          "function set(h){location.hash=Object.entries(h).filter(([k,v])=>v).map(([k,v])=>k+'='+encodeURIComponent(v)).join('&')}\n"
          "function sync(){const h=cur();$('q').value=h.q||'';$('fpeer').value=h.peer||'';$('fstatus').value=h.status||'';$('ftag').value=h.tag||'';$('fsort').value=h.sort||'id';apply()}\n"
          "function apply(){const h={q:$('q').value.trim().toLowerCase(),peer:$('fpeer').value,status:$('fstatus').value,tag:$('ftag').value};\n"
          "let rows=D.tasks.filter(r=>(!h.peer||r.peer===h.peer)&&(!h.status||r.status===h.status)&&(!h.tag||r.tags.includes(h.tag))&&(!h.q||r.title.toLowerCase().includes(h.q)||r.id.includes(h.q)));\n"
          "const k={critical:0,high:1,normal:2,low:3};const s=$('fsort').value;\n"
          "rows.sort((a,b)=>s==='due'?(a.due||'9999').localeCompare(b.due||'9999'):s==='priority'?((k[a.priority]??2)-(k[b.priority]??2)||a.id.localeCompare(b.id)):a.id.localeCompare(b.id));\n"
          "document.querySelectorAll('#tbl tbody tr').forEach(tr=>{const r=rows.find(x=>x.id===tr.dataset.id);tr.style.display=r?'':'none'});\n"
          "document.querySelectorAll('.card').forEach(c=>{const ok=rows.some(r=>r.id===c.dataset.id);c.style.display=ok?'':'none'});\n"
          "document.querySelectorAll('.col').forEach(col=>{const vis=[...col.querySelectorAll('.card')].filter(c=>c.style.display!=='none').length;col.querySelector('.n').textContent=vis});\n"
          "document.querySelectorAll('.dgroup').forEach(g=>{const vis=[...g.querySelectorAll('.card')].filter(c=>c.style.display!=='none').length;g.style.display=vis?'':'none';const n=g.querySelector('.gn');if(n)n.textContent=vis;});\n"
          "set({...h,sort:$('fsort').value})}\n"
          "document.querySelectorAll('td[data-cell]').forEach(td=>td.onclick=()=>{const[p,s]=td.dataset.cell.split('|');$('fpeer').value=p;$('fstatus').value=s;apply()});\n"
          "['q','fpeer','fstatus','ftag','fsort'].forEach(id=>$(id).addEventListener('input',apply));\n"
          "window.addEventListener('hashchange',sync);sync();\n"
          "let lastTag=null,fails=0;\n"
          "async function poll(){\n"
          "  try{\n"
          "    const h=await fetch('tasks.json',{method:'HEAD',cache:'no-store'});\n"
          "    const tag=h.headers.get('etag')||h.headers.get('last-modified')||'';\n"
          "    if(lastTag===null){lastTag=tag;return}\n"
          "    if(tag&&tag!==lastTag){location.reload();return}\n"
          "    fails=0;document.getElementById('live').classList.remove('stale');\n"
          "  }catch(e){\n"
          "    if(++fails>=3)document.getElementById('live').classList.add('stale');\n"
          "  }\n"
          "}\n"
          "\n"
          "(function(){var LIMIT=10;window.capGroups=function(){document.querySelectorAll('.dgroup').forEach(function(g){var box=g.querySelector('.dcards');if(!box)return;var old=box.querySelector('.more');if(old)old.remove();var vis=[].slice.call(box.querySelectorAll('.card')).filter(function(c){return c.style.display!=='none'});var keep=vis.slice(-LIMIT);var ks=new Set(keep);vis.forEach(function(c){if(!ks.has(c)){c.style.display='none';c.dataset.capped='1'}else{delete c.dataset.capped}});var hid=vis.length-keep.length;if(hid>0){var d=document.createElement('div');d.className='more';d.textContent='+'+hid+' more — refine filter';box.appendChild(d)}var n=g.querySelector('.gn');if(n)n.textContent=keep.length;g.style.display=keep.length?'':'none'});document.querySelectorAll('.col').forEach(function(col){var vis=[].slice.call(col.querySelectorAll('.card')).filter(function(c){return c.style.display!=='none'}).length;var n=col.querySelector('.n');if(n)n.textContent=vis})};var _orig=window.apply;window.apply=function(){if(_orig)_orig();capGroups()};capGroups()})();\n"
          "(function(){var PER=10;var PG=1;function match(){var q=document.getElementById('q').value.trim().toLowerCase(),peer=document.getElementById('fpeer').value,status=document.getElementById('fstatus').value,tag=document.getElementById('ftag').value;return [].slice.call(document.querySelectorAll('#tbl tbody tr')).filter(function(tr){return (!peer||tr.dataset.peer===peer)&&(!status||tr.dataset.status===status)&&(!tag||(tr.dataset.tags||'').split(/\\s+/).indexOf(tag)>=0)&&(!q||(tr.dataset.title||'').indexOf(q)>=0||(tr.dataset.id||'').indexOf(q)>=0)})}window.paginate=function(){var rows=match();var total=rows.length;var pages=Math.max(1,Math.ceil(total/PER));if(PG>pages)PG=pages;if(PG<1)PG=1;rows.forEach(function(tr,i){tr.style.display=(i>=(PG-1)*PER&&i<PG*PER)?'':'none'});[].slice.call(document.querySelectorAll('#tbl tbody tr')).forEach(function(tr){if(rows.indexOf(tr)<0)tr.style.display='none'});var p=document.getElementById('pager');if(!p)return;var a=total?(PG-1)*PER+1:0,b=Math.min(PG*PER,total);var h='<button data-p=\"prev\"'+(PG<=1?' disabled':'')+'>Prev</button>';for(var i=1;i<=pages;i++)h+='<button data-p=\"'+i+'\"'+(i===PG?' class=\"cur\"':'')+'>'+i+'</button>';h+='<button data-p=\"next\"'+(PG>=pages?' disabled':'')+'>Next</button>';h+='<span class=\"pinfo\">'+(total?('Showing '+a+'-'+b+' of '+total):'No tasks')+'</span>';p.innerHTML=h};var pg=document.getElementById('pager');if(pg)pg.addEventListener('click',function(e){var b=e.target.closest('button');if(!b||b.disabled)return;var v=b.dataset.p;if(v==='prev')PG--;else if(v==='next')PG++;else PG=parseInt(v,10)||1;paginate()});['q','fpeer','fstatus','ftag','fsort'].forEach(function(id){var el=document.getElementById(id);if(el)el.addEventListener('input',function(){PG=1;setTimeout(paginate,0)})});window.addEventListener('hashchange',function(){setTimeout(paginate,0)});paginate()})();\n"
          "(function(){var PER=10;var PG=1;window.paginateEv=function(){var rows=[].slice.call(document.querySelectorAll('#ev tbody tr'));var total=rows.length;var pages=Math.max(1,Math.ceil(total/PER));if(PG>pages)PG=pages;if(PG<1)PG=1;rows.forEach(function(tr,i){tr.style.display=(i>=(PG-1)*PER&&i<PG*PER)?'':'none'});var p=document.getElementById('pager-ev');if(!p)return;var a=total?(PG-1)*PER+1:0,b=Math.min(PG*PER,total);var h='<button data-p=\"prev\"'+(PG<=1?' disabled':'')+'>Prev</button>';for(var i=1;i<=pages;i++)h+='<button data-p=\"'+i+'\"'+(i===PG?' class=\"cur\"':'')+'>'+i+'</button>';h+='<button data-p=\"next\"'+(PG>=pages?' disabled':'')+'>Next</button>';h+='<span class=\"pinfo\">'+(total?('Showing '+a+'-'+b+' of '+total):'No events')+'</span>';p.innerHTML=h};paginateEv()})();\n"
          )
    payload = json.dumps({"tasks": rows, "events": ev, "decisions": decisions,
                          "peers": peers, "statuses": sorted(counts for counts in
                          {r["status"] for r in rows}),
                          "matrix": matrix, "stats": stats, "updated": updated})

    print(f"""<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>SLP Task Dashboard</title><style>{css}</style></head><body>
<h1>SLP Task Dashboard</h1>
<p class="sub">{esc(ws)} &middot; Updated (Vietnam time): {esc(updated)} &middot; {len(rows)} tasks &middot; <span id="live" class="live">live</span></p>
<div class="stats">
<div class="stat"><b>{stats.get("upcoming", 0)}</b><span>Upcoming</span></div>
<div class="stat"><b>{stats.get("working", 0)}</b><span>Working</span></div>
<div class="stat"><b>{stats.get("blocked", 0)}</b><span>Blocked</span></div>
<div class="stat"><b>{stats.get("done", 0)}</b><span>Done</span></div></div>
<div class="filters">
<input id="q" placeholder="Search id or title&hellip;">
<select id="fpeer"><option value="">All peers</option>{"".join(f"<option>{esc(x)}</option>" for x in peers)}</select>
<select id="fstatus"><option value="">All statuses</option>{"".join(f"<option>{esc(x)}</option>" for x in sorted({r['status'] for r in rows}))}</select>
<input id="ftag" placeholder="tag&hellip;">
<select id="fsort"><option value="id">Sort: ID</option><option value="priority">Sort: priority</option><option value="due">Sort: due</option></select></div>
<h2>Kanban</h2><div class="kanban">{kanban_html}</div>
<h2>Peer &times; Status</h2>
<table id="mx"><thead><tr><th>peer \\ status</th>{mhead}</tr></thead><tbody>{mrows}</tbody></table>
<h2>All tasks</h2>
<table id="tbl"><thead><tr><th>ID</th><th>Title</th><th>Peer</th><th>Status</th><th>Priority</th><th>Due (VN)</th><th>Verdict</th></tr></thead><tbody>{trows}</tbody></table><div id="pager"></div>
<h2>Recent events</h2>
<table id="ev"><thead><tr><th>#</th><th>VN time</th><th>Event</th><th>Task</th><th>Actor</th><th>Detail</th></tr></thead><tbody>{erows}</tbody></table><div id="pager-ev"></div>
<h2>Decisions</h2><ul>{dlist or "<li>&mdash;</li>"}</ul>
<script id="data" type="application/json">{payload}</script>
<script>{js}</script></body></html>""")


if __name__ == "__main__":
    main()
