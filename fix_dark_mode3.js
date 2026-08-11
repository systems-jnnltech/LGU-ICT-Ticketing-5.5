import fs from 'fs';

const files = ['src/components/TicketsList.tsx'];

const replacements = {
    '\\btext-slate-900\\b': 'text-slate-900 dark:text-slate-100',
    '\\btext-slate-800\\b': 'text-slate-800 dark:text-slate-200',
    '\\btext-slate-700\\b': 'text-slate-700 dark:text-slate-300',
    '\\btext-slate-600\\b': 'text-slate-600 dark:text-slate-400',
    '\\btext-slate-500\\b': 'text-slate-500 dark:text-slate-400',
    '\\btext-slate-400\\b': 'text-slate-400 dark:text-slate-500',
    
    '\\bbg-white\\b': 'bg-white dark:bg-[#18181b]',
    '\\bbg-slate-50/50\\b': 'bg-slate-50/50 dark:bg-white/5',
    '\\bbg-slate-50\\b': 'bg-slate-50 dark:bg-white/5',
    '\\bbg-slate-100\\b': 'bg-slate-100 dark:bg-white/10',
    '\\bbg-slate-200\\b': 'bg-slate-200 dark:bg-white/10',
    
    '\\bborder-slate-100\\b': 'border-slate-100 dark:border-white/10',
    '\\bborder-slate-200\\b': 'border-slate-200 dark:border-white/10',
    '\\bborder-slate-300\\b': 'border-slate-300 dark:border-white/20',
};

for (const file of files) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');
    for (const [k, v] of Object.entries(replacements)) {
        content = content.replace(new RegExp(k, 'g'), v);
    }
    
    // cleanups if it already ran
    content = content.replace(/dark:text-slate-400 dark:text-slate-500/g, 'dark:text-slate-400');
    content = content.replace(/dark:bg-white\/5\/50 dark:bg-white\/5/g, 'dark:bg-white/5');
    content = content.replace(/bg-slate-50 dark:bg-white\/5\/50 dark:bg-white\/5/g, 'bg-slate-50/50 dark:bg-white/5');
    content = content.replace(/text-slate-500 dark:text-slate-400 dark:text-slate-500/g, 'text-slate-500 dark:text-slate-400');

    fs.writeFileSync(file, content);
}
