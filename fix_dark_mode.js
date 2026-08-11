import fs from 'fs';

let content = fs.readFileSync('src/components/TicketDetail.tsx', 'utf8');

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

    '\\btext-orange-900\\b': 'text-orange-900 dark:text-orange-100',
    '\\btext-orange-800\\b': 'text-orange-800 dark:text-orange-200',
    '\\bbg-orange-50/50\\b': 'bg-orange-50/50 dark:bg-orange-900/20',
    '\\bbg-orange-50/80\\b': 'bg-orange-50/80 dark:bg-orange-900/30',
    '\\bborder-orange-100\\b': 'border-orange-100 dark:border-orange-900/50',
    '\\bborder-orange-200\\b': 'border-orange-200 dark:border-orange-900/50',
    
    '\\bbg-emerald-100\\b': 'bg-emerald-100 dark:bg-emerald-900/30',
    '\\btext-emerald-700\\b': 'text-emerald-700 dark:text-emerald-400',
    
    '\\bbg-blue-100\\b': 'bg-blue-100 dark:bg-blue-900/30',
    '\\btext-blue-700\\b': 'text-blue-700 dark:text-blue-400',
    
    '\\bbg-orange-100\\b': 'bg-orange-100 dark:bg-orange-900/30',
    '\\btext-orange-700\\b': 'text-orange-700 dark:text-orange-400',
    
    '\\bbg-amber-100\\b': 'bg-amber-100 dark:bg-amber-900/30',
    '\\btext-amber-700\\b': 'text-amber-700 dark:text-amber-400',
    
    '\\bbg-red-100\\b': 'bg-red-100 dark:bg-red-900/30',
    '\\btext-red-700\\b': 'text-red-700 dark:text-red-400',
    
    '\\bring-orange-50\\b': 'ring-orange-50 dark:ring-[#18181b]',
    '\\bshadow-orange-100/50\\b': 'shadow-orange-100/50 dark:shadow-orange-900/20',
};

for (const [k, v] of Object.entries(replacements)) {
    content = content.replace(new RegExp(k, 'g'), v);
}

fs.writeFileSync('src/components/TicketDetail.tsx', content);

