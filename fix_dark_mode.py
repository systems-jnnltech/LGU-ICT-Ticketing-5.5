import re

with open('src/components/TicketDetail.tsx', 'r') as f:
    content = f.read()

replacements = {
    r'\btext-slate-900\b': 'text-slate-900 dark:text-slate-100',
    r'\btext-slate-800\b': 'text-slate-800 dark:text-slate-200',
    r'\btext-slate-700\b': 'text-slate-700 dark:text-slate-300',
    r'\btext-slate-600\b': 'text-slate-600 dark:text-slate-400',
    r'\btext-slate-500\b': 'text-slate-500 dark:text-slate-400',
    r'\btext-slate-400\b': 'text-slate-400 dark:text-slate-500',
    
    r'\bbg-white\b': 'bg-white dark:bg-[#18181b]',
    r'\bbg-slate-50/50\b': 'bg-slate-50/50 dark:bg-white/5',
    r'\bbg-slate-50\b': 'bg-slate-50 dark:bg-white/5',
    r'\bbg-slate-100\b': 'bg-slate-100 dark:bg-white/10',
    r'\bbg-slate-200\b': 'bg-slate-200 dark:bg-white/10',
    
    r'\bborder-slate-100\b': 'border-slate-100 dark:border-white/10',
    r'\bborder-slate-200\b': 'border-slate-200 dark:border-white/10',
    r'\bborder-slate-300\b': 'border-slate-300 dark:border-white/20',

    r'\btext-orange-900\b': 'text-orange-900 dark:text-orange-100',
    r'\btext-orange-800\b': 'text-orange-800 dark:text-orange-200',
    r'\bbg-orange-50/50\b': 'bg-orange-50/50 dark:bg-orange-900/20',
    r'\bbg-orange-50/80\b': 'bg-orange-50/80 dark:bg-orange-900/30',
    r'\bborder-orange-100\b': 'border-orange-100 dark:border-orange-900/50',
    r'\bborder-orange-200\b': 'border-orange-200 dark:border-orange-900/50',
    
    r'\bbg-emerald-100\b': 'bg-emerald-100 dark:bg-emerald-900/30',
    r'\btext-emerald-700\b': 'text-emerald-700 dark:text-emerald-400',
    
    r'\bbg-blue-100\b': 'bg-blue-100 dark:bg-blue-900/30',
    r'\btext-blue-700\b': 'text-blue-700 dark:text-blue-400',
    
    r'\bbg-orange-100\b': 'bg-orange-100 dark:bg-orange-900/30',
    r'\btext-orange-700\b': 'text-orange-700 dark:text-orange-400',
    
    r'\bbg-amber-100\b': 'bg-amber-100 dark:bg-amber-900/30',
    r'\btext-amber-700\b': 'text-amber-700 dark:text-amber-400',
    
    r'\bbg-red-100\b': 'bg-red-100 dark:bg-red-900/30',
    r'\btext-red-700\b': 'text-red-700 dark:text-red-400',
    
    r'\bring-orange-50\b': 'ring-orange-50 dark:ring-[#18181b]',
    r'\bshadow-orange-100/50\b': 'shadow-orange-100/50 dark:shadow-orange-900/20',
    
    r'\btext-slate-800\b': 'text-slate-800 dark:text-slate-200',
    r'\btext-slate-900\b': 'text-slate-900 dark:text-slate-100',
}

for k, v in replacements.items():
    content = re.sub(k, v, content)

# additional cleanups
content = content.replace('bg-white dark:bg-[#18181b]/5', 'bg-white/5')
content = content.replace('bg-white dark:bg-[#18181b]/10', 'bg-white/10')

with open('src/components/TicketDetail.tsx', 'w') as f:
    f.write(content)

