import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Frown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FeedbackWidget({ onVoteYes }: { onVoteYes: () => void }) {
    const [isVisible, setIsVisible] = useState(false);
    const [hasVotedNo, setHasVotedNo] = useState(false);

    useEffect(() => {
        // Show widget after 5 seconds if not already closed/voted this session
        const hasInteracted = sessionStorage.getItem('cheeseoski_feedback_interacted');
        if (!hasInteracted) {
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        sessionStorage.setItem('cheeseoski_feedback_interacted', 'true');
    };

    const handleVoteNo = () => {
        setHasVotedNo(true);
        // Show crying face for 1.5 seconds, then close
        setTimeout(() => {
            handleClose();
        }, 1500);
    };

    const handleVoteYes = () => {
        handleClose(); // Close widget
        onVoteYes();   // Trigger Coffee modal
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    transition={{ duration: 0.4, type: 'spring', bounce: 0.4 }}
                    className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-80 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
                >
                    <div className="absolute top-2 right-2">
                        <button
                            onClick={handleClose}
                            className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                            aria-label="Закрыть"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="p-5">
                        <AnimatePresence mode="wait">
                            {!hasVotedNo ? (
                                <motion.div
                                    key="question"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="flex items-center gap-2 mb-3">
                                        <Sparkles className="w-5 h-5 text-amber-500" />
                                        <h4 className="font-semibold text-gray-800">Вам нравится CheeseOSKI?</h4>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                                        Будем рады узнать ваше мнение!
                                    </p>
                                    <div className="flex gap-2 w-full">
                                        <Button
                                            variant="outline"
                                            className="flex-1 border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 bg-white"
                                            onClick={handleVoteNo}
                                        >
                                            Нет
                                        </Button>
                                        <Button
                                            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md border-0"
                                            onClick={handleVoteYes}
                                        >
                                            <Heart className="w-4 h-4 mr-1.5 fill-current" /> Да
                                        </Button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="crying"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center justify-center py-4"
                                >
                                    <Frown className="w-12 h-12 text-blue-400 mb-2 drop-shadow-sm" />
                                    <p className="text-sm font-medium text-gray-600 text-center">
                                        Очень жаль...<br /><span className="text-xs text-gray-400">Мы будем стараться стать лучше!</span>
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
