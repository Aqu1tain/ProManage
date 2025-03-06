document.addEventListener("DOMContentLoaded", () => {
    // Vérifier si l'utilisateur est connecté
    if (!isLoggedIn()) {
        window.location.href = "index.html";
        return;
    }

    // Récupérer les informations de l'utilisateur connecté
    const user = getUserInfo();

    // Vérifier si l'utilisateur est un chef de projet ou admin
    if (user.role !== "project_manager" && user.role !== "admin") {
        alert("Vous n'avez pas les droits pour accéder à cette page.");
        window.location.href = "dashboard.html";
        return;
    }

    // Éléments DOM
    const teamName = document.getElementById("teamName");
    const teamInfo = document.getElementById("teamInfo");
    const invitationKey = document.getElementById("invitationKey");
    const membersList = document.getElementById("membersList");
    const pendingList = document.getElementById("pendingList");
    const backBtn = document.getElementById("backBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const generateKeyBtn = document.getElementById("generateKeyBtn");

    // Modals
    const removeMemberModal = document.getElementById("removeMemberModal");
    const memberIdToRemove = document.getElementById("memberIdToRemove");
    const cancelRemoveBtn = document.getElementById("cancelRemoveBtn");
    const confirmRemoveBtn = document.getElementById("confirmRemoveBtn");
    const closeRemoveMemberModalBtn = removeMemberModal.querySelector(".close");

    const invitationKeyModal = document.getElementById("invitationKeyModal");
    const generatedKey = document.getElementById("generatedKey");
    const copyKeyBtn = document.getElementById("copyKeyBtn");
    const closeKeyModalBtn = document.getElementById("closeKeyModalBtn");
    const closeInvitationKeyModal = invitationKeyModal.querySelector(".close");

    // Variable pour stocker les données de l'équipe
    let currentTeam = null;

    // Événements
    backBtn.addEventListener("click", () => {
        window.location.href = "dashboard.html";
    });

    logoutBtn.addEventListener("click", logout);

    // Désactiver la génération de clé pour l'instant
    generateKeyBtn.style.display = "none";

    // Événements des modals de suppression de membre
    cancelRemoveBtn.addEventListener("click", hideRemoveMemberModal);
    closeRemoveMemberModalBtn.addEventListener("click", hideRemoveMemberModal);
    confirmRemoveBtn.addEventListener("click", removeMember);

    // Événements du modal de clé d'invitation
    closeKeyModalBtn.addEventListener("click", hideInvitationKeyModal);
    closeInvitationKeyModal.addEventListener("click", hideInvitationKeyModal);
    copyKeyBtn.addEventListener("click", copyInvitationKey);

    // Fermer les modals quand on clique en dehors
    window.addEventListener("click", (event) => {
        if (event.target === removeMemberModal) {
            hideRemoveMemberModal();
        }
        if (event.target === invitationKeyModal) {
            hideInvitationKeyModal();
        }
    });

    // Charger les données de l'équipe via l'endpoint /api/teams/my
    loadTeam();

    // ==== FONCTIONS ====

    async function loadTeam() {
        try {
            const response = await authenticatedFetch(
                `${API_CONFIG.BASE_URL}/teams/my`
            );
            const data = await response.json();

            if (response.ok && data.status === "success") {
                currentTeam = data.data;
                displayTeamInfo(currentTeam);
                loadTeamMembersFromTeamData();
                loadPendingInvitationsFromTeamData();
            } else {
                console.error(
                    "Erreur lors du chargement de l'équipe:",
                    data.message
                );
                teamName.textContent = "Erreur lors du chargement de l'équipe";
                teamInfo.innerHTML =
                    '<p class="error">Impossible de charger les informations de l\'équipe</p>';
            }
        } catch (error) {
            console.error("Erreur lors du chargement de l'équipe:", error);
            teamName.textContent = "Erreur lors du chargement de l'équipe";
            teamInfo.innerHTML =
                '<p class="error">Une erreur est survenue lors du chargement de l\'équipe</p>';
        }
    }

    // Afficher les informations de l'équipe, avec la clé d'invitation affichée
    function displayTeamInfo(team) {
        teamName.textContent = team.name;
        document.title = `ProManage - Équipe ${team.name}`;

        // Afficher la clé d'invitation active si elle existe
        if (team.invitation_key) {
            invitationKey.innerHTML = `
        <strong>Clé d'invitation active:</strong> ${team.invitation_key}
        <button id="copyActiveKeyBtn" class="btn btn-sm btn-secondary" title="Copier la clé">
          <i class="fas fa-copy"></i>
        </button>
      `;
            document
                .getElementById("copyActiveKeyBtn")
                .addEventListener("click", () => {
                    navigator.clipboard
                        .writeText(team.invitation_key)
                        .then(() => {
                            alert("Clé copiée dans le presse-papiers");
                        })
                        .catch((err) => {
                            console.error("Erreur lors de la copie:", err);
                        });
                });
        } else {
            invitationKey.textContent = "Aucune clé d'invitation active";
        }
    }

    function loadTeamMembersFromTeamData() {
        membersList.innerHTML = "";
        const members = currentTeam.members || [];
        if (members.length === 0) {
            membersList.innerHTML =
                '<div class="empty-state">Aucun membre dans l\'équipe</div>';
            return;
        }
        members.forEach((member) => {
            const memberCard = createMemberCard(member);
            membersList.appendChild(memberCard);
        });
    }

    function loadPendingInvitationsFromTeamData() {
        pendingList.innerHTML = "";
        const invitations = currentTeam.invitations || [];
        if (invitations.length === 0) {
            pendingList.innerHTML =
                '<div class="empty-state">Aucune invitation en attente</div>';
            return;
        }
        invitations.forEach((invitation) => {
            const invitationCard = createInvitationCard(invitation);
            pendingList.appendChild(invitationCard);
        });
    }

    function createMemberCard(member) {
        const div = document.createElement("div");
        div.className = "member-card";
        let roleBadgeClass = "";
        let roleText = "";

        switch (member.role) {
            case "admin":
                roleBadgeClass = "role-badge role-admin";
                roleText = "Admin";
                break;
            case "project_manager":
                roleBadgeClass = "role-badge role-project-manager";
                roleText = "Chef de projet";
                break;
            case "contributor":
                roleBadgeClass = "role-badge role-contributor";
                roleText = "Contributeur";
                break;
            default:
                roleBadgeClass = "role-badge";
                roleText = member.role;
        }

        div.innerHTML = `
      <div class="member-info">
        <div class="member-name">
          ${member.name}
          <span class="${roleBadgeClass}">${roleText}</span>
        </div>
        <div class="member-role">${member.email}</div>
      </div>
    `;

        if (
            (user.role === "project_manager" || user.role === "admin") &&
            member.id !== user.id
        ) {
            const actionsDiv = document.createElement("div");
            actionsDiv.className = "member-actions";
            const removeBtn = document.createElement("button");
            removeBtn.className = "btn btn-sm btn-danger";
            removeBtn.textContent = "Retirer";
            removeBtn.addEventListener("click", () => {
                openRemoveMemberModal(member.id, member.name);
            });
            actionsDiv.appendChild(removeBtn);
            div.appendChild(actionsDiv);
        }
        return div;
    }

    function createInvitationCard(invitation) {
        const div = document.createElement("div");
        div.className = "pending-card";
        const createdDate = new Date(invitation.createdAt);
        const formattedDate = createdDate.toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
        div.innerHTML = `
      <div class="pending-info">
        <div class="pending-email">${
            invitation.email || "Adresse email inconnue"
        }</div>
        <div class="pending-date">Invité le ${formattedDate}</div>
      </div>
    `;
        const actionsDiv = document.createElement("div");
        actionsDiv.className = "pending-actions";
        const cancelBtn = document.createElement("button");
        cancelBtn.className = "btn btn-sm btn-danger";
        cancelBtn.textContent = "Annuler";
        cancelBtn.addEventListener("click", () => {
            if (confirm("Êtes-vous sûr de vouloir annuler cette invitation?")) {
                cancelInvitation(invitation.id);
            }
        });
        actionsDiv.appendChild(cancelBtn);
        div.appendChild(actionsDiv);
        return div;
    }

    function openRemoveMemberModal(id, name) {
        memberIdToRemove.value = id;
        const confirmText = document.querySelector("#removeMemberModal p");
        confirmText.textContent = `Êtes-vous sûr de vouloir retirer ${name} de l'équipe ?`;
        removeMemberModal.style.display = "block";
    }

    function hideRemoveMemberModal() {
        removeMemberModal.style.display = "none";
    }

    async function removeMember() {
        const memberId = memberIdToRemove.value;
        if (!memberId) return;
        try {
            const response = await authenticatedFetch(
                `${API_CONFIG.BASE_URL}/teams/${currentTeam.id}/members/${memberId}`,
                { method: "DELETE" }
            );
            const data = await response.json();
            if (response.ok && data.status === "success") {
                hideRemoveMemberModal();
                loadTeam();
            } else {
                console.error(
                    "Erreur lors de la suppression du membre:",
                    data.message
                );
                alert(
                    `Erreur: ${
                        data.message || "Impossible de supprimer le membre"
                    }`
                );
            }
        } catch (error) {
            console.error("Erreur lors de la suppression du membre:", error);
            alert("Une erreur est survenue lors de la suppression du membre");
        }
    }

    async function cancelInvitation(invitationId) {
        try {
            const response = await authenticatedFetch(
                `${API_CONFIG.BASE_URL}/teams/${currentTeam.id}/invitations/${invitationId}`,
                { method: "DELETE" }
            );
            const data = await response.json();
            if (response.ok && data.status === "success") {
                loadTeam();
            } else {
                console.error(
                    "Erreur lors de l'annulation de l'invitation:",
                    data.message
                );
                alert(
                    `Erreur: ${
                        data.message || "Impossible d'annuler l'invitation"
                    }`
                );
            }
        } catch (error) {
            console.error(
                "Erreur lors de l'annulation de l'invitation:",
                error
            );
            alert(
                "Une erreur est survenue lors de l'annulation de l'invitation"
            );
        }
    }

    // La fonctionnalité de génération de clé est désactivée pour l'instant.
    // function generateInvitationKey() { ... }

    function hideInvitationKeyModal() {
        invitationKeyModal.style.display = "none";
        const copySuccess = document.querySelector(".copy-success");
        if (copySuccess) {
            copySuccess.remove();
        }
    }

    function copyInvitationKey() {
        const key = generatedKey.textContent;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard
                .writeText(key)
                .then(() => {
                    alert("Clé copiée dans le presse-papiers");
                })
                .catch((err) => {
                    console.error("Erreur lors de la copie :", err);
                });
        } else {
            const tempInput = document.createElement("textarea");
            tempInput.value = key;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand("copy");
            document.body.removeChild(tempInput);
            alert("Clé copiée dans le presse-papiers");
        }
    }
});
