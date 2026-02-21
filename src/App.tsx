import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Introduction from "./pages/docs/Introduction";
import CleanCode from "./pages/docs/CleanCode";
import Naming from "./pages/docs/Naming";
import ReactStandards from "./pages/docs/frontend/ReactStandards";
import NextjsStandards from "./pages/docs/frontend/NextjsStandards";
import DjangoStandards from "./pages/docs/backend/DjangoStandards";
import ApiStandards from "./pages/docs/backend/ApiStandards";
import CommitNaming from "./pages/docs/git/CommitNaming";
import GitWorkflow from "./pages/docs/git/GitWorkflow";
import Libraries from "./pages/docs/Libraries";
import Security from "./pages/docs/Security";
import Authentication from "./pages/docs/Authentication";
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
          {/* Standards */}
          <Route path="/docs/clean-code" element={<CleanCode />} />
          <Route path="/docs/naming" element={<Naming />} />
          {/* Frontend */}
          <Route path="/docs/frontend/react" element={<ReactStandards />} />
          <Route path="/docs/frontend/nextjs" element={<NextjsStandards />} />
          {/* Backend */}
          <Route path="/docs/backend/django" element={<DjangoStandards />} />
          <Route path="/docs/backend/api" element={<ApiStandards />} />
          {/* Git */}
          <Route path="/docs/git/commits" element={<CommitNaming />} />
          <Route path="/docs/git/workflow" element={<GitWorkflow />} />
          {/* Libraries & Security */}
          <Route path="/docs/libraries" element={<Libraries />} />
          <Route path="/docs/security" element={<Security />} />
          {/* Projet illustration : Blog API */}
          <Route path="/docs/authentication" element={<Authentication />} />
          <Route path="/docs/models/post" element={<PostModel />} />
          <Route path="/docs/models/comment" element={<CommentModel />} />
          <Route path="/docs/models/like" element={<LikeModel />} />
          <Route path="/docs/serializers/post" element={<PostSerializer />} />
          <Route path="/docs/serializers/comment" element={<CommentSerializer />} />
          <Route path="/docs/serializers/like" element={<LikeSerializer />} />
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
