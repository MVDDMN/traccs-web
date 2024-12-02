// TermsModal.jsx
import React from 'react';
import './TermsModal.css'; // Import the CSS file for styles

const TermsModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="new-login-modal-overlay">
            <div className="new-login-modal-box">
                <div className="new-login-modal-content">
                    <h2 className="new-login-modal-title">Terms and Conditions</h2>

                    <h3 className="new-login-modal-heading">1. Introduction</h3>
                    <p className="new-login-modal-text">
                        Welcome to TRACCS. By accessing and using this platform, you agree to comply with and be bound by the following terms and conditions.
                        Please read them carefully. If you do not agree to any part of these terms, you should refrain from using this application.
                    </p>

                    <h3 className="new-login-modal-heading">2. User Responsibilities</h3>
                    <p className="new-login-modal-text">
                        As a user, you agree to use this platform for lawful purposes only. You are responsible for ensuring that your activities comply with all applicable laws,
                        regulations, and guidelines. Any breach of these laws or terms may result in the suspension or termination of your account.
                        <strong className="new-login-modal-strong"> False reporting</strong>, including the submission of incorrect, misleading, or fraudulent information, is strictly prohibited and subject to legal consequences.
                        Under Article 154 of the Revised Penal Code of the Philippines, any person who publishes or spreads false information that may endanger public order, cause panic,
                        or damage reputation may face penalties. Violations may be subject to further penalties under Republic Act No. 10175 or the Cybercrime Prevention Act of 2012.
                    </p>

                    <h3 className="new-login-modal-heading">3. Account Security</h3>
                    <p className="new-login-modal-text">
                        You are responsible for maintaining the confidentiality of your login credentials and any activities that occur under your account.
                        TRACCS will not be liable for any loss or damage arising from your failure to safeguard your credentials.
                        Should you suspect unauthorized use of your account, please contact our support team immediately.
                    </p>

                    <h3 className="new-login-modal-heading">4. Data Privacy</h3>
                    <p className="new-login-modal-text">
                        We are committed to protecting your privacy. By agreeing to these terms, you acknowledge that you have read and understood our Privacy Policy,
                        which governs the collection, use, and disclosure of your personal information. TRACCS complies with the Philippine Data Privacy Act of 2012 (Republic Act No. 10173),
                        ensuring that all user data is protected in accordance with applicable laws.
                    </p>

                    <h3 className="new-login-modal-heading">5. Limitation of Liability</h3>
                    <p className="new-login-modal-text">
                        TRACCS is provided "as is" and "as available." We make no warranties, expressed or implied, regarding the accuracy, reliability, or availability of the platform.
                        In no event shall TRACCS or its affiliates be liable for any indirect, incidental, or consequential damages arising from the use or inability to use the platform.
                    </p>

                    <h3 className="new-login-modal-heading">6. Modifications to Terms</h3>
                    <p className="new-login-modal-text">
                        We reserve the right to update or modify these terms at any time without prior notice.
                        Continued use of the platform after any changes indicates your acceptance of the new terms.
                    </p>

                    <h3 className="new-login-modal-heading">7. Governing Law</h3>
                    <p className="new-login-modal-text">
                        These terms shall be governed and construed in accordance with the laws of the Philippines, without regard to its conflict of law provisions.
                        Any disputes arising out of or in connection with the use of this platform shall be subject to the exclusive jurisdiction of the courts in Taytay, Rizal.
                    </p>

                    <div className='new-login-modal-btn-box'>
                        <button className="new-login-modal-close-btn" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsModal;