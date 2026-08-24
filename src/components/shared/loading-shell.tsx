// 统一加载壳：所有 loading.tsx 用它包裹（骨架屏 + 淡入过渡）。
export function LoadingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-fade-in" aria-busy="true">
      {children}
    </div>
  );
}
