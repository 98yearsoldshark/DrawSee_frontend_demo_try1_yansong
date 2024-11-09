export interface BotChat {
    content: string;
    attachments?: { id: string; type: string; url: string }[];
    iframe?: string;
}

export interface RequestModel {
    chat_id: string;
    message: BotChat[];
    userid: string;
}

export interface ResponseModel {
    userid: string;
    chat_id: string;
    message: BotChat[];
}

export interface Agent {
    _id: string;
    name: string;
    description: string;
    knowledge_base_id: string;
}

export interface KnowledgeBase {
    knowledge_base_id: string;
    name: string;
    description: string;
}
