'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { fadeUp } from '@/lib/motion';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={fadeUp}
      className={className}
    >
      {children}
    </motion.div>
  );
}
