import React, { useState } from "react";
import {
  Sparkles,
  Copy,
  RefreshCw,
  Plus,
  Trash2,
  Tv,
  Film,
  Dna,
  AudioLines,
  BookOpen,
  ArrowRight,
  FileText,
  AlertTriangle,
  ChevronRight,
  Edit2,
  CheckCircle
} from "lucide-react";
import { Scene, DNAProfile, GeneratedPrompt, YouTubeDescription } from "./types";

// Dynamic Toast Notifications
interface Toast {
  id: string;
  message: string;
  type: "success" | "info" | "error";
}

// Sample Story Presets
const SAMPLE_STORIES = [
  {
    title: "Sự Tích Chùa Đá Cổ",
    content: "Ánh trăng bợt bạt hắt qua khe cửa gỗ mục nát, soi rõ bóng dáng gầy gò của một nam tử đang ho sù sụ bên bếp tro tàn. Khói bếp len lỏi làm cay xè khóe mắt, nhưng chàng vẫn mải miết cời những thanh củi ướt sũng. Chàng tên là Minh, vốn hiền lành chăm chỉ.\nĐột nhiên, cánh cửa gỗ bị đạp tung ra, gió bấc tràn vào lạnh buốt. Tên cường hào Lý Bá mặt mày bặm trợn bước vào, theo sau là hai tên sai vây hung tợn. Hắn quát lớn đòi Minh phải giao ra mảnh ruộng gia bảo.\nMinh quỳ sụp xuống van xin, nước mắt nhạt nhòa. Nhưng tên cường hào nhẫn tâm ra lệnh cho sai vây đập phá gian nhà nát, rồi cướp đi khế ước đất đai duy nhất."
  },
  {
    title: "Luật Nhân Quả - Lòng Tham Khó Đáy",
    content: "Lão phú ông nổi tiếng keo kiệt nhất vùng, lúc nào cũng khư khư giữ hũ vàng dưới gầm giường. Lão không bao giờ bố thí cho ai dù chỉ một hạt gạo ẩm mốc.\nMột ngày nọ, một người hành khất đói lả gõ cửa xin ngụm nước ấm. Lão phú ông xua đuổi phũ phàng, thậm chí còn thả chó dữ ra xua đuổi khiến người hành khất bị thương.\nĐêm ấy, một trận hỏa hoạn bất ngờ bùng lên thiêu rụi toàn bộ gia sản của lão phú ông. Lão điên cuồng cứu hũ vàng nhưng ngọn lửa hung tàn đã nuốt chửng tất cả, chỉ để lại đống tro tàn hoang lạnh."
  }
];

export default function App() {
  // General App states
  const [activeTab, setActiveTab] = useState<"script" | "dna" | "prompt" | "youtube">("script");
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Module 1: Script Splitter states
  const [storyInput, setStoryInput] = useState("");
  const [isSplitting, setIsSplitting] = useState(false);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [editingSceneText, setEditingSceneText] = useState("");

  // Module 2: DNA System states
  const [isGeneratingDNA, setIsGeneratingDNA] = useState(false);
  const [dnaProfiles, setDnaProfiles] = useState<DNAProfile[]>([]);
  const [selectedDnaType, setSelectedDnaType] = useState<"all" | "character" | "object" | "setting">("all");
  const [editingDnaId, setEditingDnaId] = useState<string | null>(null);
  const [editingDnaDesc, setEditingDnaDesc] = useState("");
  const [regeneratingDnaIds, setRegeneratingDnaIds] = useState<Record<string, boolean>>({});

  // Module 2: Custom DNA entry states
  const [customDnaInput, setCustomDnaInput] = useState("");
  const [isParsingCustomDna, setIsParsingCustomDna] = useState(false);
  const [dnaInputTab, setDnaInputTab] = useState<"auto" | "paste" | "form">("auto");
  const [manualName, setManualName] = useState("");
  const [manualType, setManualType] = useState<"character" | "object" | "setting">("character");
  const [manualDesc, setManualDesc] = useState("");

  // Module 3: Auto-Chaining Prompt Generator states
  const [prompts, setPrompts] = useState<GeneratedPrompt[]>([]);
  const [promptProgress, setPromptProgress] = useState({ current: 0, total: 0 });
  const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false);
  const [isAutoJumping, setIsAutoJumping] = useState(true);
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null);
  const [editingPromptText, setEditingPromptText] = useState("");
  const [regeneratingPromptIds, setRegeneratingPromptIds] = useState<Record<string, boolean>>({});

  // Module 4: YouTube SEO states
  const [ytStories, setYtStories] = useState<string[]>(["", ""]);
  const [isGeneratingYT, setIsGeneratingYT] = useState(false);
  const [ytResult, setYtResult] = useState<YouTubeDescription | null>(null);
  const [isEditingYT, setIsEditingYT] = useState(false);
  const [editedYT, setEditedYT] = useState<YouTubeDescription | null>(null);

  // Show status toasts helper
  const addToast = (message: string, type: "success" | "info" | "error" = "success") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const copyToClipboard = (text: string, subject: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
        addToast(`Đã sao chép ${subject}!`, "success");
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.top = "0";
        textarea.style.left = "0";
        textarea.style.position = "fixed";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const successful = document.execCommand("copy");
        document.body.removeChild(textarea);
        if (successful) {
          addToast(`Đã sao chép ${subject}!`, "success");
        } else {
          throw new Error("Không thể sao chép");
        }
      }
    } catch (err) {
      addToast(`Không thể sao chép tự động. Hãy bôi đen văn bản để sao chép.`, "error");
    }
  };

  // Preset loading handler
  const loadPreset = (index: number) => {
    const preset = SAMPLE_STORIES[index];
    setStoryInput(preset.content);
    addToast(`Đã tải truyện mẫu: "${preset.title}"`, "info");
  };

  // --- MODULE 1 ACTIONS ---
  const handleSplitScript = async () => {
    if (!storyInput.trim()) {
      addToast("Vui lòng dán nội dung truyện vào ô nhập liệu.", "error");
      return;
    }
    setIsSplitting(true);
    try {
      const res = await fetch("/api/split-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ story: storyInput })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Không thể phân tách kịch bản.");
      }
      const data = await res.json();
      setScenes(data);
      addToast(`Tách thành công ${data.length} phân cảnh kịch bản!`, "success");
      setActiveTab("dna");
    } catch (err: any) {
      addToast(err.message, "error");
    } finally {
      setIsSplitting(false);
    }
  };

  const handleRegenerateScript = async () => {
    if (window.confirm("Bạn có chắc chắn muốn phân tách lại toàn bộ kịch bản?")) {
      await handleSplitScript();
    }
  };

  const saveSceneEdit = (id: string) => {
    setScenes((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const charMatch = editingSceneText.match(/\(([^)]+)\)$/);
          const chars = charMatch ? charMatch[1] : s.characters;
          return {
            ...s,
            content: editingSceneText,
            characters: chars
          };
        }
        return s;
      })
    );
    setEditingSceneId(null);
    addToast("Đã lưu thay đổi phân cảnh.", "success");
  };

  const handleRegenerateSingleScene = async (id: string, currentContent: string) => {
    addToast("Đang viết lại phân cảnh này...", "info");
    try {
      const res = await fetch("/api/split-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ story: currentContent })
      });
      if (!res.ok) throw new Error("Thử lại thất bại.");
      const data = await res.json();
      if (data && data.length > 0) {
        setScenes((prev) =>
          prev.map((s) => (s.id === id ? { ...s, content: data[0].content, characters: data[0].characters, textOnly: data[0].textOnly } : s))
        );
        addToast("Đã cập nhật phân cảnh mới thành công!", "success");
      }
    } catch (err: any) {
      addToast("Không thể viết lại phân cảnh. Hãy chỉnh sửa thủ công.", "error");
    }
  };

  const getFullScriptText = () => {
    return scenes.map((s, idx) => `Cảnh ${idx + 1}:\n${s.content}`).join("\n\n");
  };

  // --- MODULE 2 ACTIONS ---
  const handleGenerateDNA = async () => {
    if (scenes.length === 0) {
      addToast("Vui lòng tách kịch bản ở Phần 1 trước.", "error");
      setActiveTab("script");
      return;
    }
    setIsGeneratingDNA(true);
    try {
      const res = await fetch("/api/generate-dna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenes })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Không thể tạo hồ sơ ADN.");
      }
      const data = await res.json();
      setDnaProfiles(data);
      addToast(`Đã thiết lập thành công ${data.length} hồ sơ ADN hình ảnh!`, "success");
      setActiveTab("prompt");
    } catch (err: any) {
      addToast(err.message, "error");
    } finally {
      setIsGeneratingDNA(false);
    }
  };

  const handleRegenerateSingleDna = async (id: string, name: string, type: "character" | "object" | "setting") => {
    setRegeneratingDnaIds((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await fetch("/api/generate-single-dna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityName: name,
          entityType: type,
          scenesContext: scenes.slice(0, 5)
        })
      });
      if (!res.ok) throw new Error("Cập nhật thất bại.");
      const data = await res.json();
      setDnaProfiles((prev) =>
        prev.map((d) => (d.id === id ? { ...d, description: data.description } : d))
      );
      addToast(`Đã cập nhật lại ADN cho "${name}"!`, "success");
    } catch (err: any) {
      addToast(`Không thể tạo lại ADN: ${err.message}`, "error");
    } finally {
      setRegeneratingDnaIds((prev) => ({ ...prev, [id]: false }));
    }
  };

  const saveDnaEdit = (id: string) => {
    setDnaProfiles((prev) =>
      prev.map((d) => (d.id === id ? { ...d, description: editingDnaDesc } : d))
    );
    setEditingDnaId(null);
    addToast("Đã cập nhật thiết kế ADN hình ảnh.", "success");
  };

  const getFullDnaText = () => {
    return dnaProfiles
      .map((d) => `[${d.type.toUpperCase()} DNA: ${d.name}]\n${d.description}`)
      .join("\n\n");
  };

  const handleParseCustomDna = async () => {
    if (!customDnaInput.trim()) {
      addToast("Vui lòng dán nội dung ADN vào ô nhập liệu.", "error");
      return;
    }
    setIsParsingCustomDna(true);
    try {
      const res = await fetch("/api/parse-custom-dna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawDnaText: customDnaInput, scenes })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Không thể phân tích ADN.");
      }
      const data = await res.json();
      setDnaProfiles(data);
      addToast(`Đã phân tích và lưu thành công ${data.length} hồ sơ ADN từ nội dung dán!`, "success");
      setCustomDnaInput("");
      addToast("Đã đồng bộ và cập nhật thành công! Bạn có thể chuyển sang Bước 3.", "info");
    } catch (err: any) {
      addToast(err.message, "error");
    } finally {
      setIsParsingCustomDna(false);
    }
  };

  const handleAddManualDna = () => {
    if (!manualName.trim() || !manualDesc.trim()) {
      addToast("Vui lòng điền đầy đủ Tên thực thể và Mô tả ADN.", "error");
      return;
    }
    const newDna: DNAProfile = {
      id: `dna_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: manualName.trim(),
      type: manualType,
      description: manualDesc.trim()
    };
    setDnaProfiles((prev) => [...prev, newDna]);
    setManualName("");
    setManualDesc("");
    addToast(`Đã thêm thủ công hồ sơ ADN cho "${newDna.name}" thành công!`, "success");
  };

  // --- MODULE 3 ACTIONS ---
  const triggerPromptsAutoChaining = async () => {
    if (scenes.length === 0) {
      addToast("Vui lòng hoàn thành kịch bản phân cảnh ở Phần 1 trước.", "error");
      setActiveTab("script");
      return;
    }
    if (dnaProfiles.length === 0) {
      addToast("Chưa có hồ sơ ADN. Vui lòng khởi tạo ADN ở Phần 2.", "error");
      setActiveTab("dna");
      return;
    }

    setIsGeneratingPrompts(true);
    setPrompts([]);
    setPromptProgress({ current: 0, total: scenes.length });

    const totalScenes = scenes.length;
    let index = 0;
    const batchSize = 6;
    let accumulatedPrompts: GeneratedPrompt[] = [];

    const processNextBatch = async () => {
      if (index >= totalScenes) {
        setIsGeneratingPrompts(false);
        addToast("Hoàn thành sản xuất toàn bộ prompt tự động!", "success");
        return;
      }

      const batchScenes = scenes.slice(index, index + batchSize);
      const currentBatchNum = Math.floor(index / batchSize) + 1;
      const totalBatches = Math.ceil(totalScenes / batchSize);

      addToast(`Đang chạy chuỗi liên hoàn: Nhóm ${currentBatchNum}/${totalBatches} (Cảnh ${index + 1} - ${Math.min(index + batchSize, totalScenes)})`, "info");

      try {
        const res = await fetch("/api/generate-prompts-batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scenes: batchScenes, dnas: dnaProfiles })
        });

        if (!res.ok) throw new Error("Chạy lô prompt thất bại.");
        const batchPrompts: GeneratedPrompt[] = await res.json();

        accumulatedPrompts = [...accumulatedPrompts, ...batchPrompts];
        setPrompts(accumulatedPrompts);
        index += batchSize;
        setPromptProgress({ current: Math.min(index, totalScenes), total: totalScenes });

        if (isAutoJumping && index < totalScenes) {
          setTimeout(() => {
            processNextBatch();
          }, 1500);
        } else {
          setIsGeneratingPrompts(false);
          if (index < totalScenes) {
            addToast("Đã tạm dừng chuỗi.", "info");
          }
        }
      } catch (err: any) {
        addToast(`Gặp lỗi tại nhóm ${currentBatchNum}: ${err.message}`, "error");
        setIsGeneratingPrompts(false);
      }
    };

    processNextBatch();
  };

  const handleRegenerateSinglePrompt = async (sceneId: string, scene: Scene) => {
    setRegeneratingPromptIds((prev) => ({ ...prev, [sceneId]: true }));
    try {
      const res = await fetch("/api/generate-single-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scene, dnas: dnaProfiles })
      });
      if (!res.ok) throw new Error("Thử lại thất bại.");
      const data = await res.json();
      setPrompts((prev) =>
        prev.map((p) => (p.sceneId === sceneId ? { ...p, prompt: data.prompt } : p))
      );
      addToast(`Đã làm mới prompt cho Cảnh ${sceneId}!`, "success");
    } catch (err: any) {
      addToast(err.message, "error");
    } finally {
      setRegeneratingPromptIds((prev) => ({ ...prev, [sceneId]: false }));
    }
  };

  const savePromptEdit = (sceneId: string) => {
    setPrompts((prev) =>
      prev.map((p) => (p.sceneId === sceneId ? { ...p, prompt: editingPromptText } : p))
    );
    setEditingPromptId(null);
    addToast("Đã lưu prompt tùy chỉnh.", "success");
  };

  const getFullJSONPromptsOutput = () => {
    const jsonObjects = prompts.map((p) => {
      return JSON.stringify({ prompt: p.prompt }, null, 2);
    });
    return `[\n${jsonObjects.join(",\n\n")}\n]`;
  };

  // --- MODULE 4 ACTIONS ---
  const handleAddYtStory = () => {
    setYtStories([...ytStories, ""]);
    addToast("Đã thêm ô nhập câu chuyện mới.", "info");
  };

  const handleRemoveYtStory = (index: number) => {
    if (ytStories.length <= 1) {
      addToast("Phải giữ lại ít nhất một câu chuyện để viết mô tả.", "error");
      return;
    }
    const filtered = ytStories.filter((_, i) => i !== index);
    setYtStories(filtered);
    addToast("Đã gỡ bỏ ô nhập câu chuyện.", "info");
  };

  const handleYtStoryChange = (index: number, val: string) => {
    const updated = [...ytStories];
    updated[index] = val;
    setYtStories(updated);
  };

  const handleGenerateYTDescription = async () => {
    const activeStories = ytStories.filter((s) => s.trim() !== "");
    if (activeStories.length === 0) {
      addToast("Vui lòng nhập ít nhất một câu chuyện để viết mô tả.", "error");
      return;
    }

    setIsGeneratingYT(true);
    try {
      const res = await fetch("/api/generate-youtube-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stories: activeStories })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Không thể khởi tạo mô tả.");
      }
      const data = await res.json();
      setYtResult(data);
      setEditedYT(data);
      addToast("Đã tạo thành công bộ mô tả YouTube SEO chuẩn hóa!", "success");
    } catch (err: any) {
      addToast(err.message, "error");
    } finally {
      setIsGeneratingYT(false);
    }
  };

  const getFullYouTubeDescriptionPlaintext = () => {
    if (!editedYT) return "";

    const summariesBlock = editedYT.summaries
      .map((s) => `Câu chuyện ${s.index}: ${s.text}`)
      .join("\n\n");

    return `🎬 TIÊU ĐỀ VIDEO:
${editedYT.videoTitle}

🎨 TIÊU ĐỀ THUMBNAIL:
${editedYT.thumbnailTitle}

📝 TÓM TẮT NỘI DUNG:
${summariesBlock}

${editedYT.warning}

🔗 KẾT NỐI VÀ ỦNG HỘ:
${editedYT.connection}

🏷️ HASHTAGS:
${editedYT.hashtags}`;
  };

  const importCurrentScenesToYt = () => {
    if (scenes.length === 0) {
      addToast("Không tìm thấy kịch bản phân cảnh ở Phần 1.", "error");
      return;
    }
    const combinedText = scenes.map((s) => s.textOnly || s.content.replace(/\([^)]+\)$/, "")).join(" ");
    const updated = [...ytStories];
    updated[0] = combinedText;
    setYtStories(updated);
    addToast("Đã đồng bộ kịch bản hiện tại sang Phần 4!", "success");
  };

  const filteredDnas = dnaProfiles.filter(
    (p) => selectedDnaType === "all" || p.type === selectedDnaType
  );

  return (
    <div id="main-root-container" className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* Dynamic Toast System */}
      <div id="toast-wrapper" className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            id={`toast-${t.id}`}
            className={`px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 transition-all transform duration-300 translate-y-0 opacity-100 bg-slate-900 border ${
              t.type === "success"
                ? "border-emerald-500/40 text-emerald-300"
                : t.type === "error"
                ? "border-rose-500/40 text-rose-300"
                : "border-amber-500/40 text-amber-300"
            }`}
          >
            {t.type === "success" && <CheckCircle className="h-5 w-5 shrink-0 text-emerald-400" />}
            {t.type === "error" && <AlertTriangle className="h-5 w-5 shrink-0 text-rose-400" />}
            {t.type === "info" && <Sparkles className="h-5 w-5 shrink-0 text-amber-400" />}
            <span className="text-sm font-medium">{t.message}</span>
          </div>
        ))}
      </div>

      {/* Header Space */}
      <header id="app-header" className="border-b border-slate-900 bg-slate-950/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-amber-500 to-rose-600 p-2 rounded-xl text-slate-950 shadow-lg">
              <Film className="h-6 w-6 font-bold" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-amber-200 via-rose-200 to-white bg-clip-text text-transparent font-display">
                BỘ HẬU KỲ TRUYỆN AI
              </h1>
              <p className="text-xs text-slate-400 font-medium">Post-Production Automation Kit for Creators</p>
            </div>
          </div>

          {/* Quick Stats Overview */}
          <div className="flex items-center gap-2 text-xs bg-slate-900/60 p-1.5 rounded-lg border border-slate-800">
            <div className="px-3 py-1 bg-slate-950 rounded-md">
              <span className="text-slate-500 mr-1">Kịch bản:</span>
              <span className="text-amber-300 font-semibold">{scenes.length} cảnh</span>
            </div>
            <div className="px-3 py-1 bg-slate-950 rounded-md">
              <span className="text-slate-500 mr-1">ADN:</span>
              <span className="text-rose-300 font-semibold">{dnaProfiles.length} thiết kế</span>
            </div>
            <div className="px-3 py-1 bg-slate-950 rounded-md">
              <span className="text-slate-500 mr-1">Prompts:</span>
              <span className="text-emerald-300 font-semibold">{prompts.length} hình</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Steps */}
      <div id="step-navigation-bar" className="bg-slate-900/40 border-b border-slate-900 sticky top-[73px] z-20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex justify-between md:justify-start md:gap-8 overflow-x-auto py-3 select-none no-scrollbar">
            <button
              id="nav-btn-script"
              onClick={() => setActiveTab("script")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                activeTab === "script"
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                  : "text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
            >
              <AudioLines className="h-4 w-4" />
              1. Tách Phân Cảnh
            </button>

            <ChevronRight className="h-4 w-4 text-slate-700 self-center hidden md:block" />

            <button
              id="nav-btn-dna"
              onClick={() => setActiveTab("dna")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                activeTab === "dna"
                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                  : "text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
            >
              <Dna className="h-4 w-4" />
              2. Hồ sơ ADN
            </button>

            <ChevronRight className="h-4 w-4 text-slate-700 self-center hidden md:block" />

            <button
              id="nav-btn-prompt"
              onClick={() => setActiveTab("prompt")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                activeTab === "prompt"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                  : "text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              3. Chạy Lô Prompts
            </button>

            <ChevronRight className="h-4 w-4 text-slate-700 self-center hidden md:block" />

            <button
              id="nav-btn-youtube"
              onClick={() => setActiveTab("youtube")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                activeTab === "youtube"
                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                  : "text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
            >
              <Tv className="h-4 w-4" />
              4. YouTube SEO
            </button>
          </nav>
        </div>
      </div>

      {/* Main Workspace Body */}
      <main id="main-workspace-content" className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        
        {/* MODULE 1: BỘ TÁCH KỊCH BẢN PHÂN CẢNH AUDIO */}
        {activeTab === "script" && (
          <div id="module-1-container" className="space-y-6">
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-lg font-bold font-display flex items-center gap-2 text-amber-300">
                    <AudioLines className="h-5 w-5" /> PHẦN 1: BỘ TÁCH KỊCH BẢN PHÂN CẢNH AUDIO
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Tự động tách câu chuyện thô thành các phân cảnh audio tối ưu dưới 250 ký tự, ghép câu và nhận diện tag nhân vật.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Thử nhanh truyện mẫu:</span>
                  {SAMPLE_STORIES.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => loadPreset(idx)}
                      className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-all text-slate-300"
                    >
                      Mẫu {idx + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Input area */}
              <div className="space-y-3">
                <textarea
                  id="story-textarea-input"
                  rows={8}
                  value={storyInput}
                  onChange={(e) => setStoryInput(e.target.value)}
                  placeholder="Dán nội dung câu chuyện chữ mộc mạc của bạn vào đây..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition-all duration-300 resize-y"
                />

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-500 font-mono">
                    Độ dài: <span className="text-slate-300">{storyInput.length} ký tự</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      id="btn-split-script-submit"
                      onClick={handleSplitScript}
                      disabled={isSplitting}
                      className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSplitting ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Đang xử lý tách cảnh...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Tách Kịch Bản
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Output Segment of Module 1 */}
            {scenes.length > 0 && (
              <div id="module-1-output-block" className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-900 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 text-xs bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full font-bold font-mono">
                      {scenes.length} Phân cảnh
                    </span>
                    <h3 className="text-sm font-semibold text-slate-200">Kết quả kịch bản phân cảnh Audio</h3>
                  </div>

                  {/* Panel level action buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      id="btn-copy-full-script"
                      onClick={() => copyToClipboard(getFullScriptText(), "toàn bộ kịch bản")}
                      className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-1.5 transition-all"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Sao chép toàn bộ
                    </button>
                    <button
                      id="btn-regenerate-full-script"
                      onClick={handleRegenerateScript}
                      className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-1.5 transition-all"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Viết lại toàn bộ
                    </button>
                  </div>
                </div>

                {/* List of processed individual scenes */}
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {scenes.map((scene, idx) => {
                    const isEditing = editingSceneId === scene.id;
                    return (
                      <div
                        key={scene.id}
                        id={`scene-item-${scene.id}`}
                        className="bg-slate-950 border border-slate-900 hover:border-slate-800 rounded-xl p-4 transition-all space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="text-xs font-mono font-bold bg-slate-900 text-slate-400 px-2 py-0.5 rounded-md border border-slate-800">
                            Cảnh {idx + 1}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => saveSceneEdit(scene.id)}
                                  className="text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md transition-all font-semibold"
                                >
                                  Lưu
                                </button>
                                <button
                                  onClick={() => setEditingSceneId(null)}
                                  className="text-xs text-slate-400 hover:text-slate-300 bg-slate-900 px-2.5 py-1 rounded-md transition-all border border-slate-800"
                                >
                                  Hủy
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingSceneId(scene.id);
                                    setEditingSceneText(scene.content);
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-900 rounded-lg transition-all"
                                  title="Chỉnh sửa thủ công"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleRegenerateSingleScene(scene.id, scene.textOnly)}
                                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-all"
                                  title="Viết lại phần này"
                                >
                                  <RefreshCw className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => copyToClipboard(scene.content, `Phân cảnh ${idx + 1}`)}
                                  className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-900 rounded-lg transition-all"
                                  title="Sao chép kịch bản phân cảnh"
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Story Content Area */}
                        {isEditing ? (
                          <textarea
                            rows={3}
                            value={editingSceneText}
                            onChange={(e) => setEditingSceneText(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 text-sm p-3 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
                          />
                        ) : (
                          <div className="text-sm leading-relaxed text-slate-200">
                            {scene.content.replace(/\(([^)]+)\)$/, "")}
                            <span className="text-amber-400 font-semibold bg-amber-500/5 px-2 py-0.5 rounded ml-1 border border-amber-500/10">
                              ({scene.characters || "Không có nhân vật"})
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-900/60 pt-2 font-mono">
                          <span>Ký tự: {scene.content.length} / 250</span>
                          <span>Bảo toàn nguyên văn gốc: 100%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    onClick={() => setActiveTab("dna")}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl text-xs text-amber-400 font-bold transition-all shadow-md group"
                  >
                    Chuyển sang Bước 2: Thiết lập hồ sơ ADN
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODULE 2: HỆ THỐNG ADN ĐỒNG NHẤT HÌNH ẢNH */}
        {activeTab === "dna" && (
          <div id="module-2-container" className="space-y-6">
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 border-b border-slate-900 pb-4">
                <div>
                  <h2 className="text-lg font-bold font-display flex items-center gap-2 text-rose-300">
                    <Dna className="h-5 w-5" /> PHẦN 2: HỆ THỐNG ADN ĐỒNG NHẤT HÌNH ẢNH (DNA)
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Thiết lập hồ sơ tạo hình đồng nhất cho câu chuyện (bằng tiếng Anh chuyên môn chi tiết kèm khối Donghua Art Style).
                  </p>
                </div>
              </div>

              {/* DNA Input Method Selection Sub-Tabs */}
              <div id="dna-input-method-tabs" className="flex gap-2 pb-4 mb-4 overflow-x-auto no-scrollbar border-b border-slate-900/50">
                <button
                  id="tab-dna-auto"
                  type="button"
                  onClick={() => setDnaInputTab("auto")}
                  className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    dnaInputTab === "auto"
                      ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                      : "bg-slate-950/40 text-slate-400 border-transparent hover:text-slate-200"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  🔮 Khởi Tạo Tự Động Bằng AI
                </button>
                <button
                  id="tab-dna-paste"
                  type="button"
                  onClick={() => setDnaInputTab("paste")}
                  className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    dnaInputTab === "paste"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      : "bg-slate-950/40 text-slate-400 border-transparent hover:text-slate-200"
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  📋 Tự Dán ADN Của Bạn (AI Dịch & Chuẩn Hóa)
                </button>
                <button
                  id="tab-dna-form"
                  type="button"
                  onClick={() => setDnaInputTab("form")}
                  className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    dnaInputTab === "form"
                      ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                      : "bg-slate-950/40 text-slate-400 border-transparent hover:text-slate-200"
                  }`}
                >
                  <Plus className="h-3.5 w-3.5" />
                  ➕ Tự Thêm Thủ Công (Không Dùng AI)
                </button>
              </div>

              {/* TAB 1: AUTO GENERATE */}
              {dnaInputTab === "auto" && (
                <div id="dna-tab-auto-content" className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-900">
                    <div className="text-xs text-slate-400">
                      Hệ thống AI sẽ quét kịch bản phân cảnh từ Phần 1 để tự động thiết kế hồ sơ tạo hình nhất quán cho nhân vật, đồ vật và bối cảnh.
                    </div>
                    {scenes.length === 0 ? (
                      <div className="text-xs bg-amber-500/10 text-amber-300 px-3 py-1.5 rounded-lg border border-amber-500/20 shrink-0">
                        Vui lòng tách kịch bản ở Phần 1 trước.
                      </div>
                    ) : (
                      <button
                        id="btn-generate-dna-start"
                        onClick={handleGenerateDNA}
                        disabled={isGeneratingDNA}
                        className="px-4 py-2 bg-gradient-to-r from-rose-500 to-amber-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50 shrink-0"
                      >
                        {isGeneratingDNA ? (
                          <>
                            <RefreshCw className="h-3 w-3 animate-spin" />
                            Đang quét và dựng ADN...
                          </>
                        ) : (
                          <>
                            <Dna className="h-3 w-3" />
                            Quét & Khởi Tạo Bằng AI
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {dnaProfiles.length === 0 && !isGeneratingDNA && (
                    <div className="border border-dashed border-slate-800 rounded-xl p-8 text-center text-slate-500 bg-slate-950/20">
                      <Dna className="h-10 w-10 mx-auto text-slate-700 mb-3" />
                      <p className="text-sm font-medium">Chưa có hồ sơ thiết kế ADN nào được thiết lập.</p>
                      <p className="text-xs mt-1">
                        Nhấn nút <span className="text-rose-400 font-bold">"Quét & Khởi Tạo Bằng AI"</span> hoặc chuyển sang tab tự dán để tạo dữ liệu.
                      </p>
                    </div>
                  )}

                  {isGeneratingDNA && (
                    <div className="space-y-4 py-6">
                      <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
                        <span>Đang trích xuất nhân vật & bối cảnh...</span>
                        <span className="animate-pulse">Vui lòng đợi giây lát...</span>
                      </div>
                      <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-900">
                        <div className="bg-gradient-to-r from-rose-500 to-amber-500 h-full animate-progress animate-pulse" style={{ width: "65%" }}></div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: PASTE RAW CUSTOM DNA */}
              {dnaInputTab === "paste" && (
                <div id="dna-tab-paste-content" className="space-y-4">
                  <div className="text-xs text-slate-400">
                    Dán nội dung hồ sơ tạo hình nhân vật, bối cảnh, đồ vật của bạn vào ô dưới đây (bằng tiếng Việt hoặc tiếng Anh). AI sẽ phân tích, dịch thuật chuyên môn chi tiết sang tiếng Anh và áp dụng chuẩn nghệ thuật Donghua để đồng bộ cho Bước tiếp theo.
                  </div>
                  <textarea
                    id="custom-dna-textarea"
                    rows={6}
                    value={customDnaInput}
                    onChange={(e) => setCustomDnaInput(e.target.value)}
                    placeholder="Ví dụ dán:
- Nhân vật Minh: nam tử gầy gò hiền lành, mặc áo vải xám rách bợt vai, tóc đen dài buộc gọn gàng bằng dây vải thô.
- Bối cảnh Chùa Đá Cổ: một ngôi chùa bằng đá rêu phong cổ kính trên đỉnh núi cao mờ sương, bao quanh bởi rừng trúc tĩnh mịch dưới ánh trăng hoang lạnh."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition-all duration-300 resize-y font-mono"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-mono">Độ dài: {customDnaInput.length} ký tự</span>
                    <button
                      id="btn-parse-custom-dna-submit"
                      type="button"
                      onClick={handleParseCustomDna}
                      disabled={isParsingCustomDna || !customDnaInput.trim()}
                      className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isParsingCustomDna ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          Đang phân tích & tối ưu hóa...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3.5 w-3.5" />
                          Phân Tích & Đồng Bộ ADN Tự Dán
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: DIRECT FORM ADD */}
              {dnaInputTab === "form" && (
                <div id="dna-tab-form-content" className="space-y-4 bg-slate-950/20 p-4 rounded-xl border border-slate-900">
                  <div className="text-xs text-slate-400">
                    Nhập trực tiếp từng hồ sơ tạo hình chi tiết (khuyên dùng tiếng Anh để tạo ảnh đẹp nhất) để thêm thẳng vào danh sách ADN mà không qua xử lý AI.
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400 font-semibold">Tên thực thể (tiếng Việt có dấu)</label>
                      <input
                        id="manual-dna-name-input"
                        type="text"
                        value={manualName}
                        onChange={(e) => setManualName(e.target.value)}
                        placeholder="Ví dụ: Minh, Tên Lý Bá, Chùa Đá Cổ..."
                        className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/50 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400 font-semibold">Loại thực thể</label>
                      <select
                        id="manual-dna-type-select"
                        value={manualType}
                        onChange={(e) => setManualType(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/50 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none transition-all"
                      >
                        <option value="character">Nhân vật (Character)</option>
                        <option value="object">Đồ vật (Object)</option>
                        <option value="setting">Bối cảnh (Setting)</option>
                      </select>
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs text-slate-400 font-semibold">Mô tả chi tiết bằng tiếng Anh (English Prompt Description)</label>
                      <textarea
                        id="manual-dna-desc-input"
                        rows={4}
                        value={manualDesc}
                        onChange={(e) => setManualDesc(e.target.value)}
                        placeholder="Ví dụ: A young handsome scholar with long black hair tied with blue cloth, wearing traditional white and grey Hanfu robe, kind and humble look..."
                        className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/50 rounded-xl p-3 text-sm text-slate-200 focus:outline-none transition-all resize-y font-mono"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      id="btn-add-manual-dna-submit"
                      type="button"
                      onClick={handleAddManualDna}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5"
                    >
                      <Plus className="h-4 w-4" />
                      Lưu Hồ Sơ ADN Này
                    </button>
                  </div>
                </div>
              )}

              {dnaProfiles.length > 0 && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-900 pb-4">
                    <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
                      {(["all", "character", "object", "setting"] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => setSelectedDnaType(type)}
                          className={`px-3 py-1 text-xs rounded-md transition-all font-semibold capitalize ${
                            selectedDnaType === type
                              ? "bg-slate-800 text-rose-300"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {type === "all"
                            ? "Tất cả"
                            : type === "character"
                            ? "Nhân vật"
                            : type === "object"
                            ? "Đồ vật (Prop)"
                            : "Bối cảnh (Setting)"}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(getFullDnaText(), "toàn bộ ADN")}
                        className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-1.5 transition-all"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Sao chép toàn bộ ADN
                      </button>
                      <button
                        onClick={handleGenerateDNA}
                        className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-1.5 transition-all"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Viết lại toàn bộ ADN
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredDnas.map((profile) => {
                      const isEditing = editingDnaId === profile.id;
                      const isRegenerating = regeneratingDnaIds[profile.id] || false;
                      return (
                        <div
                          key={profile.id}
                          id={`dna-card-${profile.id}`}
                          className="bg-slate-950 border border-slate-900 rounded-xl p-4 flex flex-col justify-between hover:border-rose-900/30 transition-all space-y-3"
                        >
                          <div>
                            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                                    profile.type === "character"
                                      ? "bg-rose-500/15 text-rose-400 border border-rose-500/20"
                                      : profile.type === "object"
                                      ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                                      : "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                                  }`}
                                >
                                  {profile.type === "character"
                                    ? "Nhân vật"
                                    : profile.type === "object"
                                    ? "Đồ vật"
                                    : "Bối cảnh"}
                                </span>
                                <h4 className="text-sm font-bold text-slate-200">{profile.name}</h4>
                              </div>

                              <div className="flex items-center gap-1">
                                {isEditing ? (
                                  <>
                                    <button
                                      onClick={() => saveDnaEdit(profile.id)}
                                      className="text-xs text-emerald-400 hover:text-emerald-300 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded transition-all font-semibold"
                                    >
                                      Lưu
                                    </button>
                                    <button
                                      onClick={() => setEditingDnaId(null)}
                                      className="text-xs text-slate-400 hover:text-slate-300 px-2 py-1 bg-slate-900 border border-slate-800 rounded transition-all"
                                    >
                                      Hủy
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => {
                                        setEditingDnaId(profile.id);
                                        setEditingDnaDesc(profile.description);
                                      }}
                                      className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-900 rounded transition-all"
                                      title="Chỉnh sửa ADN thủ công"
                                    >
                                      <Edit2 className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleRegenerateSingleDna(profile.id, profile.name, profile.type)}
                                      disabled={isRegenerating}
                                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded transition-all disabled:opacity-50"
                                      title="Viết lại phần này"
                                    >
                                      <RefreshCw className={`h-3.5 w-3.5 ${isRegenerating ? "animate-spin" : ""}`} />
                                    </button>
                                    <button
                                      onClick={() => copyToClipboard(profile.description, `ADN của ${profile.name}`)}
                                      className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-900 rounded transition-all"
                                      title="Sao chép ADN"
                                    >
                                      <Copy className="h-3.5 w-3.5" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="mt-2 text-xs text-slate-300 leading-relaxed max-h-[220px] overflow-y-auto pr-1">
                              {isEditing ? (
                                <textarea
                                  rows={8}
                                  value={editingDnaDesc}
                                  onChange={(e) => setEditingDnaDesc(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-700 text-xs p-2 rounded text-slate-100 focus:outline-none focus:border-rose-500"
                                />
                              ) : (
                                <div className="space-y-2 whitespace-pre-line font-mono select-text">
                                  {profile.description}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono border-t border-slate-900/60 pt-2 shrink-0">
                            <span>Từ: ~{profile.description.split(/\s+/).filter(Boolean).length} words</span>
                            <span>Độ nhất quán: 100%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {dnaProfiles.length > 0 && (
                <div className="flex justify-end pt-6 border-t border-slate-900 mt-6">
                  <button
                    onClick={() => setActiveTab("prompt")}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl text-xs text-rose-400 font-bold transition-all shadow-md group"
                  >
                    Chuyển sang Bước 3: Sản xuất Prompt tự động
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODULE 3: QUY TRÌNH SẢN XUẤT PROMPT TỰ ĐỘNG */}
        {activeTab === "prompt" && (
          <div id="module-3-container" className="space-y-6">
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-lg font-bold font-display flex items-center gap-2 text-emerald-300">
                    <Sparkles className="h-5 w-5" /> PHẦN 3: QUY TRÌNH SẢN XUẤT PROMPT TỰ ĐỘNG (JSON)
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Tự động kết hợp dữ liệu Phân cảnh (Phần 1) và hồ sơ ADN (Phần 2) để tạo các Prompt cấu trúc 11 phần phân tách bởi dấu "|" theo cơ chế liên hoàn 6 prompt liên tục.
                  </p>
                </div>

                {scenes.length === 0 || dnaProfiles.length === 0 ? (
                  <div className="text-xs bg-amber-500/10 text-amber-300 px-3 py-1.5 rounded-lg border border-amber-500/20">
                    Cần phân tách kịch bản & tạo ADN trước khi tiếp tục.
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer select-none bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                      <input
                        type="checkbox"
                        checked={isAutoJumping}
                        onChange={(e) => setIsAutoJumping(e.target.checked)}
                        className="rounded border-slate-800 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
                      />
                      Chuỗi tự động (Auto-Jump 6 prompt)
                    </label>

                    <button
                      id="btn-trigger-prompts-chainer"
                      onClick={triggerPromptsAutoChaining}
                      disabled={isGeneratingPrompts}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {isGeneratingPrompts ? (
                        <>
                          <RefreshCw className="h-3 w-3 animate-spin" />
                          Chuỗi liên hoàn đang chạy...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3 w-3" />
                          Sản Xuất Chuỗi Prompt
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {prompts.length === 0 && !isGeneratingPrompts && (
                <div className="border border-dashed border-slate-800 rounded-xl p-8 text-center text-slate-500">
                  <Sparkles className="h-10 w-10 mx-auto text-slate-700 mb-3" />
                  <p className="text-sm font-medium">Chưa có prompt tạo ảnh tự động.</p>
                  <p className="text-xs mt-1">
                    Nhấn nút <span className="text-emerald-400 font-bold">"Sản Xuất Chuỗi Prompt"</span> để khởi động tiến trình lắp ghép ADN hoàn chỉnh 11 thành phần.
                  </p>
                </div>
              )}

              {(isGeneratingPrompts || prompts.length > 0) && (
                <div className="space-y-4">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold font-mono">
                      <span className="text-emerald-400">Tiến trình lắp ghép ADN & Prompt:</span>
                      <span className="text-slate-300">
                        {promptProgress.current} / {promptProgress.total} Cảnh
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-500"
                        style={{ width: `${(promptProgress.current / (promptProgress.total || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-900 pb-3">
                    <h3 className="text-sm font-bold text-slate-200">Mảng JSON Prompt Kết Quả (Sao chép nguyên xi)</h3>

                    <div className="flex items-center gap-2">
                      <button
                        id="btn-copy-json-prompts"
                        onClick={() => copyToClipboard(getFullJSONPromptsOutput(), "Mảng JSON prompt")}
                        className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-1.5 transition-all"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Sao chép tất cả prompt (JSON)
                      </button>
                      <button
                        onClick={triggerPromptsAutoChaining}
                        className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-1.5 transition-all"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Viết lại toàn bộ prompt
                      </button>
                    </div>
                  </div>

                  <details className="bg-slate-950 rounded-xl border border-slate-900 p-3 group">
                    <summary className="text-xs text-slate-400 cursor-pointer font-bold select-none hover:text-slate-200 flex items-center gap-2">
                      <span className="bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-[10px] text-emerald-400 font-mono">
                        JSON RAW
                      </span>
                      Xem cấu trúc JSON đầu ra (Có phân cách dòng trống)
                    </summary>
                    <textarea
                      readOnly
                      rows={8}
                      value={getFullJSONPromptsOutput()}
                      className="w-full mt-3 bg-slate-900/60 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-300 focus:outline-none focus:ring-0"
                    />
                  </details>

                  <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                    {prompts.map((p, idx) => {
                      const relatedScene = scenes.find((s) => s.id === p.sceneId);
                      const isEditing = editingPromptId === p.sceneId;
                      const isRegenerating = regeneratingPromptIds[p.sceneId] || false;
                      const parts = p.prompt.split("|");

                      return (
                        <div
                          key={p.sceneId}
                          id={`prompt-card-${p.sceneId}`}
                          className="bg-slate-950 border border-slate-900 hover:border-emerald-950/40 rounded-xl p-4 transition-all space-y-3"
                        >
                          <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold bg-slate-900 text-emerald-400 px-2.5 py-0.5 rounded border border-slate-800">
                                Cảnh {idx + 1} Prompt
                              </span>
                              {relatedScene && (
                                <span className="text-xs text-slate-400 truncate max-w-md hidden md:block">
                                  "{relatedScene.content.replace(/\([^)]+\)$/, "").slice(0, 50)}..."
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5">
                              {isEditing ? (
                                <>
                                  <button
                                    onClick={() => savePromptEdit(p.sceneId)}
                                    className="text-xs text-emerald-400 hover:text-emerald-300 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded font-semibold transition-all"
                                  >
                                    Lưu
                                  </button>
                                  <button
                                    onClick={() => setEditingPromptId(null)}
                                    className="text-xs text-slate-400 hover:text-slate-300 px-2 py-1 bg-slate-900 border border-slate-800 rounded transition-all"
                                  >
                                    Hủy
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditingPromptId(p.sceneId);
                                      setEditingPromptText(p.prompt);
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-900 rounded transition-all"
                                    title="Chỉnh sửa thủ công"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleRegenerateSinglePrompt(p.sceneId, relatedScene || { id: p.sceneId, content: "", textOnly: "", characters: "" })}
                                    disabled={isRegenerating}
                                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded transition-all disabled:opacity-50"
                                    title="Viết lại phần này"
                                  >
                                    <RefreshCw className={`h-3.5 w-3.5 ${isRegenerating ? "animate-spin" : ""}`} />
                                  </button>
                                  <button
                                    onClick={() => copyToClipboard(p.prompt, `Prompt cảnh ${idx + 1}`)}
                                    className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-900 rounded transition-all"
                                    title="Sao chép prompt"
                                  >
                                    <Copy className="h-3.5 w-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-line select-text">
                            {isEditing ? (
                              <textarea
                                rows={4}
                                value={editingPromptText}
                                onChange={(e) => setEditingPromptText(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 text-xs p-2 rounded text-slate-100 focus:outline-none focus:border-emerald-500"
                              />
                            ) : (
                              <div className="space-y-1.5">
                                <p className="text-[11px] text-slate-400 font-semibold uppercase">Chuỗi prompt 11 phần hoàn chỉnh:</p>
                                <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg text-[11px] overflow-x-auto text-emerald-300">
                                  {p.prompt}
                                </div>

                                <details className="mt-2 text-[10px] text-slate-400">
                                  <summary className="cursor-pointer select-none font-semibold hover:text-slate-300">
                                    Mục chi tiết cấu phần (11 mục phân tách)
                                  </summary>
                                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 p-2 bg-slate-900/30 rounded border border-slate-800 text-slate-300 font-mono">
                                    {parts.map((part, pIdx) => (
                                      <div key={pIdx} className="flex gap-1.5 border-b border-slate-900 py-1">
                                        <span className="text-slate-500 font-bold">Mục {pIdx + 1}:</span>
                                        <span className="truncate" title={part}>{part || "N/A"}</span>
                                      </div>
                                    ))}
                                  </div>
                                </details>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {prompts.length > 0 && (
                <div className="flex justify-end pt-6 border-t border-slate-900 mt-6">
                  <button
                    onClick={() => setActiveTab("youtube")}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl text-xs text-emerald-400 font-bold transition-all shadow-md group"
                  >
                    Chuyển sang Bước 4: Viết mô tả YouTube SEO
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODULE 4: YOUTUBE DESCRIPTION GENERATOR */}
        {activeTab === "youtube" && (
          <div id="module-4-container" className="space-y-6">
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-lg font-bold font-display flex items-center gap-2 text-blue-300">
                    <Tv className="h-5 w-5" /> PHẦN 4: YOUTUBE DESCRIPTION GENERATOR (GOM NHÓM ĐA TRUYỆN)
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Gom nhóm nhiều câu chuyện riêng lẻ để tạo một bộ mô tả SEO chuẩn hóa, bao gồm tiêu đề cấp kép, tóm tắt lôi cuốn, cảnh báo và tag hashtags đặc thù.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {scenes.length > 0 && (
                    <button
                      onClick={importCurrentScenesToYt}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold rounded-lg text-xs transition-all flex items-center gap-1"
                    >
                      <BookOpen className="h-3 w-3" /> Đồng bộ truyện Phần 1
                    </button>
                  )}
                  <button
                    onClick={handleAddYtStory}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg text-xs transition-all flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" /> Thêm truyện
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {ytStories.map((story, idx) => (
                  <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-2 relative">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400">Văn bản câu chuyện {idx + 1}</span>
                      <button
                        onClick={() => handleRemoveYtStory(idx)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-all"
                        title="Xóa truyện này"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <textarea
                      rows={4}
                      value={story}
                      onChange={(e) => handleYtStoryChange(idx, e.target.value)}
                      placeholder={`Dán nội dung truyện ${idx + 1} vào đây...`}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500/50 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-all resize-y"
                    />
                  </div>
                ))}

                <div className="flex justify-end mt-4">
                  <button
                    id="btn-generate-yt-seo"
                    onClick={handleGenerateYTDescription}
                    disabled={isGeneratingYT}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                  >
                    {isGeneratingYT ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Đang tạo mô tả SEO YouTube...
                      </>
                    ) : (
                      <>
                        <Tv className="h-4 w-4" />
                        Viết mô tả chung cho các câu chuyện này
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {editedYT && (
              <div id="yt-output-block" className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-900 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 text-xs bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full font-bold font-mono">
                      SEO Chuẩn Hóa
                    </span>
                    <h3 className="text-sm font-semibold text-slate-200">BỘ MÔ TẢ YOUTUBE HOÀN CHỈNH</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(getFullYouTubeDescriptionPlaintext(), "toàn bộ mô tả")}
                      className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-1.5 transition-all"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Sao chép toàn bộ mô tả
                    </button>
                    <button
                      onClick={handleGenerateYTDescription}
                      className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-1.5 transition-all"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Viết lại toàn bộ mô tả
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="space-y-4">
                    
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400">🎨 TIÊU ĐỀ THUMBNAIL (3-5 chữ):</span>
                        <button
                          onClick={() => copyToClipboard(editedYT.thumbnailTitle, "tiêu đề Thumbnail")}
                          className="p-1 text-slate-400 hover:text-emerald-400 transition-all"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {isEditingYT ? (
                        <input
                          type="text"
                          value={editedYT.thumbnailTitle}
                          onChange={(e) => setEditedYT({ ...editedYT, thumbnailTitle: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-amber-300 font-semibold focus:outline-none"
                        />
                      ) : (
                        <p className="text-sm font-bold text-amber-300 bg-amber-500/5 p-2 rounded border border-amber-500/10 inline-block">
                          {editedYT.thumbnailTitle}
                        </p>
                      )}
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400">🎬 TIÊU ĐỀ VIDEO CHUNG (&lt;70 ký tự):</span>
                        <button
                          onClick={() => copyToClipboard(editedYT.videoTitle, "tiêu đề video")}
                          className="p-1 text-slate-400 hover:text-emerald-400 transition-all"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {isEditingYT ? (
                        <input
                          type="text"
                          value={editedYT.videoTitle}
                          onChange={(e) => setEditedYT({ ...editedYT, videoTitle: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white font-semibold focus:outline-none"
                        />
                      ) : (
                        <p className="text-sm font-semibold text-slate-100 uppercase leading-snug">
                          {editedYT.videoTitle}
                        </p>
                      )}
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                        <span className="text-xs font-bold text-slate-400">📝 TÓM TẮT TRUYỆN LÔ ĐA DẠNG:</span>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              editedYT.summaries.map((s) => `Câu chuyện ${s.index}: ${s.text}`).join("\n\n"),
                              "Tóm tắt các truyện"
                            )
                          }
                          className="p-1 text-slate-400 hover:text-emerald-400 transition-all"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                        {editedYT.summaries.map((s, sIdx) => (
                          <div key={sIdx} className="space-y-1 bg-slate-900/40 p-2.5 rounded border border-slate-900/80">
                            <span className="text-[10px] font-bold text-blue-400">CÂU CHUYỆN {s.index}</span>
                            {isEditingYT ? (
                              <textarea
                                rows={3}
                                value={s.text}
                                onChange={(e) => {
                                  const updatedSummaries = [...editedYT.summaries];
                                  updatedSummaries[sIdx].text = e.target.value;
                                  setEditedYT({ ...editedYT, summaries: updatedSummaries });
                                }}
                                className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none"
                              />
                            ) : (
                              <p className="text-xs leading-relaxed text-slate-300 italic">
                                {s.text}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  <div className="space-y-4">
                    
                    <div className="bg-slate-950 p-4 rounded-xl border border-rose-950/20 space-y-2 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full filter blur-xl"></div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3 text-rose-400" />
                          CẢNH BÁO NỘI DUNG (100% BẢO TOÀN):
                        </span>
                        <button
                          onClick={() => copyToClipboard(editedYT.warning, "khối Cảnh báo nội dung")}
                          className="p-1 text-slate-400 hover:text-emerald-400 transition-all relative z-10"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="p-3 bg-rose-950/10 border border-rose-900/20 rounded-lg text-xs leading-relaxed text-rose-200/95 font-mono select-all">
                        {editedYT.warning}
                      </div>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400">🔗 KHỐI KẾT NỐI & ỦNG HỘ:</span>
                        <button
                          onClick={() => copyToClipboard(editedYT.connection, "khối Liên hệ & ủng hộ")}
                          className="p-1 text-slate-400 hover:text-emerald-400 transition-all"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {isEditingYT ? (
                        <textarea
                          rows={4}
                          value={editedYT.connection}
                          onChange={(e) => setEditedYT({ ...editedYT, connection: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-300 font-mono focus:outline-none"
                        />
                      ) : (
                        <p className="text-xs font-mono leading-relaxed text-slate-400 whitespace-pre-wrap select-all bg-slate-900/30 p-2.5 rounded border border-slate-900">
                          {editedYT.connection}
                        </p>
                      )}
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400">🏷️ BỘ HASHTAGS SEO CHUẨN (15 tag):</span>
                        <button
                          onClick={() => copyToClipboard(editedYT.hashtags, "bộ Hashtags")}
                          className="p-1 text-slate-400 hover:text-emerald-400 transition-all"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {isEditingYT ? (
                        <input
                          type="text"
                          value={editedYT.hashtags}
                          onChange={(e) => setEditedYT({ ...editedYT, hashtags: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-blue-300 font-semibold focus:outline-none"
                        />
                      ) : (
                        <div className="flex flex-wrap gap-1.5 p-2 bg-slate-900/30 border border-slate-900 rounded-lg">
                          {editedYT.hashtags.split(/\s+/).filter(Boolean).map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-md text-[10px] font-mono font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-900">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-blue-400" />
                      GIAO DIỆN PLAIN TEXTBOX MÔ TẢ ĐẦY ĐỦ (Chỉnh sửa nhanh trực tiếp)
                    </span>
                    <button
                      onClick={() => setIsEditingYT(!isEditingYT)}
                      className={`px-3 py-1 text-xs rounded border transition-all font-semibold ${
                        isEditingYT
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                      }`}
                    >
                      {isEditingYT ? "Xong / Xem trước" : "Bật chế độ chỉnh sửa tay"}
                    </button>
                  </div>

                  <textarea
                    rows={12}
                    value={getFullYouTubeDescriptionPlaintext()}
                    readOnly={!isEditingYT}
                    onChange={(e) => {
                      if (isEditingYT) {
                        const rawVal = e.target.value;
                        const matchVideo = rawVal.match(/🎬 TIÊU ĐỀ VIDEO:\n([^]*?)\n\n🎨/);
                        const matchThumb = rawVal.match(/🎨 TIÊU ĐỀ THUMBNAIL:\n([^]*?)\n\n📝/);
                        const matchWarn = rawVal.match(/(📌 CẢNH BÁO NỘI DUNG:[^]*?)\n\n🔗/);
                        const matchConn = rawVal.match(/🔗 KẾT NỐI VÀ ỦNG HỘ:\n([^]*?)\n\n🏷️/);
                        const matchHash = rawVal.match(/🏷️ HASHTAGS:\n([^]*?)$/);

                        const videoTitle = matchVideo ? matchVideo[1].trim() : editedYT.videoTitle;
                        const thumbnailTitle = matchThumb ? matchThumb[1].trim() : editedYT.thumbnailTitle;
                        const warning = matchWarn ? matchWarn[1].trim() : editedYT.warning;
                        const connection = matchConn ? matchConn[1].trim() : editedYT.connection;
                        const hashtags = matchHash ? matchHash[1].trim() : editedYT.hashtags;

                        setEditedYT({
                          ...editedYT,
                          videoTitle,
                          thumbnailTitle,
                          warning,
                          connection,
                          hashtags
                        });
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono leading-relaxed text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500/40 select-all"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer id="app-footer" className="border-t border-slate-900 py-6 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
          <p className="text-xs text-slate-500 font-medium">
            Bộ Hậu Kỳ Truyện AI &copy; 2026 • Đồng bộ kịch bản, ADN tạo hình, Auto-Chaining Prompt, và YouTube SEO Metadata.
          </p>
          <div className="flex justify-center gap-4 text-[10px] text-slate-600 font-mono">
            <span>Thiết kế Donghua Animation Style</span>
            <span>•</span>
            <span>Bảo toàn kịch bản 100%</span>
            <span>•</span>
            <span>Auto-Jump Chaining Lô 6 Prompts</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
