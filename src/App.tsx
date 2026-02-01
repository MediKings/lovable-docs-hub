import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Introduction from "./pages/docs/Introduction";
import PostModel from "./pages/docs/models/PostModel";
import CommentModel from "./pages/docs/models/CommentModel";
import LikeModel from "./pages/docs/models/LikeModel";
import PostSerializer from "./pages/docs/serializers/PostSerializer";
import CommentSerializer from "./pages/docs/serializers/CommentSerializer";
import LikeSerializer from "./pages/docs/serializers/LikeSerializer";
import PostViews from "./pages/docs/views/PostViews";
import CommentViews from "./pages/docs/views/CommentViews";
import LikeViews from "./pages/docs/views/LikeViews";
import ViewCount from "./pages/docs/views/ViewCount";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/docs" element={<Introduction />} />
          {/* Models */}
          <Route path="/docs/models/post" element={<PostModel />} />
          <Route path="/docs/models/comment" element={<CommentModel />} />
          <Route path="/docs/models/like" element={<LikeModel />} />
          {/* Serializers */}
          <Route path="/docs/serializers/post" element={<PostSerializer />} />
          <Route path="/docs/serializers/comment" element={<CommentSerializer />} />
          <Route path="/docs/serializers/like" element={<LikeSerializer />} />
          {/* Views */}
          <Route path="/docs/views/posts" element={<PostViews />} />
          <Route path="/docs/views/comments" element={<CommentViews />} />
          <Route path="/docs/views/likes" element={<LikeViews />} />
          <Route path="/docs/views/view-count" element={<ViewCount />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
