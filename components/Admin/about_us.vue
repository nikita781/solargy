<script setup>
import Editor from "~/components/editor.vue";
import {onMounted, ref} from "vue";
import axios from "axios";

onMounted(async () => {
  const token = localStorage.getItem('authToken');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    await fetchAbout_usBlock();
    await fetchPatents();
    await fetchTeams();
  }
});

const isLoading = ref(false);

const errors = ref({
  about_usTitle: false,
  about_usDescription: false,
  about_usImage: false,

  patentName: false,
  patentDate: false,
  patentText: false,

  teamName: false,
  teamDescription: false,
  teamImage: false,
  teamPhone: false,
  teamEmail: false,
});

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы начинаются с 0
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

const about_usBlock = ref([]);
const about_usTitle = ref('');
const about_usDescription = ref('');
const about_usImage = ref(null);
const about_usFile = ref(null);
const isEditingAbout_usBlock = ref(false);
const currentAbout_usBlockId = ref(null);

const handleExportHtmlAbout_usBlock = (html) => {
  about_usDescription.value = html;
}
const fetchAbout_usBlock = async () => {
  try {
    const response = await axios.get(`/pages/2`, {
      headers: {},
    });
    about_usBlock.value = response.data;
  } catch (error) {
    console.error('Ошибка при загрузке продуктов:', error.response?.data || error);
  }
};
const handleFileChangeAbout_usBlock = (event) => {
  const file = event.target.files[0];
  if (file) {
    about_usImage.value = file;
  }
};
const createAbout_usBlock = async () => {
  errors.value.about_usTitle = false;
  errors.value.about_usDescription = false;
  errors.value.about_usImage = false;
  errors.value.about_usTitle = !about_usTitle.value;
  errors.value.about_usDescription = !about_usDescription.value;
  errors.value.about_usImage = !about_usImage.value;
  try {
    const formData = new FormData();
    formData.append('sections[0][title]', about_usTitle.value);
    formData.append('sections[0][html]', about_usDescription.value);
    formData.append('sections[0][image]', about_usImage.value);

    await axios.post(`/pages/2?_method=patch`, formData, {
      headers: {

        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchAbout_usBlock();
    about_usTitle.value = '';
    about_usDescription.value = '';
    about_usImage.value = null;
    about_usFile.value.value = ''
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
}
const updateAbout_usBlock = async () => {
  errors.value.about_usTitle = false;
  errors.value.about_usDescription = false;
  errors.value.about_usTitle = !about_usTitle.value;
  errors.value.about_usDescription = !about_usDescription.value;
  try {
    const formData = new FormData();
    formData.append('sections[0][id]', currentAbout_usBlockId.value);
    formData.append('sections[0][title]', about_usTitle.value);
    formData.append('sections[0][html]', about_usDescription.value);
    if (about_usImage.value) {
      formData.append('sections[0][image]', about_usImage.value);
    }

    await axios.post(`/pages/2?_method=patch`, formData, {
      headers: {

        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchAbout_usBlock();
    resetAbout_usBlock();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
}
const deleteAbout_usBlock = async (idBlock) => {
  try {
    await axios.delete(`/pages/${idBlock}`, {
      headers: {},
    });
    await fetchAbout_usBlock();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
const editAbout_usBlock = (block) => {
  isEditingAbout_usBlock.value = true;
  currentAbout_usBlockId.value = block.id;
  about_usTitle.value = block.title;
  about_usDescription.value = block.html;
  errors.value.about_usTitle = false;
  errors.value.about_usDescription = false;
  errors.value.about_usImage = false;
};
const resetAbout_usBlock = () => {
  isEditingAbout_usBlock.value = false;
  about_usTitle.value = '';
  about_usDescription.value = '';
  about_usImage.value = null;
  about_usFile.value.value = ''
  currentAbout_usBlockId.value = null
  errors.value.about_usTitle = false;
  errors.value.about_usDescription = false;
  errors.value.about_usImage = false;
};


const patents = ref([]);
const isEditingPatent = ref(false);
const patentName = ref('');
const patentDate = ref('');
const patentFile = ref(null);
const patentText = ref(null)

const fetchPatents = async () => {
  try {
    const response = await axios.get(`/patents`, {
      headers: {},
    });
    patents.value = response.data.data;
  } catch (error) {
    console.error('Ошибка при загрузке продуктов:', error.response?.data || error);
  }
};
const handleFileChangePatent = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (
      file.type === 'text/plain' ||
      file.type === 'application/json' ||
      file.name.endsWith('.csv')
  ) {
    patentText.value = file;
  }
};
const createProductPatent = async () => {
  errors.value.patentName = false;
  errors.value.patentDate = false;
  errors.value.patentText = false;
  errors.value.patentName = !patentName.value;
  errors.value.patentDate = !patentDate.value;
  errors.value.patentText = !patentFile.value;
  try {
    const formData = new FormData();
    formData.append('title', patentName.value);
    formData.append('date', patentDate.value);
    formData.append('file', patentText.value);

    await axios.post(`/patents`, formData, {
      headers: {

        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchPatents();
    patentName.value = '';
    patentDate.value = '';
    patentText.value = null;
    patentFile.value.value = ''
    errors.value.patentName = false;
    errors.value.patentDate = false;
    errors.value.patentText = false;
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
}
const deletePatents = async (idPatent) => {
  try {
    await axios.delete(`/patents/${idPatent}`, {
      headers: {},
    });
    await fetchPatents();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};


const teams = ref([]);
const isEditingTeam = ref(false);
const teamName = ref('');
const teamDescription = ref('');
const teamImage = ref(null);
const teamFile = ref(null);
const teamPhone = ref('');
const teamEmail = ref('');
const currentTeamId = ref(null);

const fetchTeams = async () => {
  try {
    const response = await axios.get(`/teams`, {
      headers: {},
    });
    teams.value = response.data;
  } catch (error) {
    console.error('Ошибка при загрузке продуктов:', error.response?.data || error);
  }
};
const handleFileChangeTeam = (event) => {
  const file = event.target.files[0];
  if (file) {
    teamImage.value = file;
  }
};
const createTeams = async () => {
  errors.value.teamName = false;
  errors.value.teamDescription = false;
  errors.value.teamImage = false;
  errors.value.teamPhone = false;
  errors.value.teamEmail = false;
  errors.value.teamName = !teamName.value;
  errors.value.teamDescription = !teamDescription.value;
  errors.value.teamImage = !teamImage.value;
  errors.value.teamPhone = !teamPhone.value;
  errors.value.teamEmail = !teamEmail.value;
  try {
    const formData = new FormData();
    formData.append('name', teamName.value);
    formData.append('description', teamDescription.value);
    formData.append('image', teamImage.value);
    formData.append('phone', teamPhone.value);
    formData.append('email', teamEmail.value);

    await axios.post(`/teams`, formData, {
      headers: {

        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchTeams();
    resetTeam();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
}
const updateTeams = async () => {
  errors.value.teamName = false;
  errors.value.teamDescription = false;
  errors.value.teamPhone = false;
  errors.value.teamEmail = false;
  errors.value.teamName = !teamName.value;
  errors.value.teamDescription = !teamDescription.value;
  errors.value.teamPhone = !teamPhone.value;
  errors.value.teamEmail = !teamEmail.value;
  try {
    const formData = new FormData();
    formData.append('name', teamName.value);
    formData.append('description', teamDescription.value);
    if (teamImage.value) {
      formData.append('image', teamImage.value);
    }
    formData.append('phone', teamPhone.value);
    formData.append('email', teamEmail.value);

    await axios.post(`/teams/${currentTeamId.value}?_method=patch`, formData, {
      headers: {

        'Content-Type': 'multipart/form-data',
      },
    });
    await fetchTeams();
    resetTeam();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
}
const deleteTeam = async (idTeam) => {
  try {
    await axios.delete(`/teams/${idTeam}`, {
      headers: {},
    });
    await fetchTeams();
  } catch (error) {
    console.error('Ошибка:', error.response?.data || error);
  }
};
const editTeam = (team) => {
  isEditingTeam.value = true;
  currentTeamId.value = team.id;
  teamName.value = team.name;
  teamDescription.value = team.description;
  teamPhone.value = team.phone;
  teamEmail.value = team.email;
  errors.value.teamName = false;
  errors.value.teamDescription = false;
  errors.value.teamImage = false;
  errors.value.teamPhone = false;
  errors.value.teamEmail = false;
};
const resetTeam = () => {
  isEditingTeam.value = false;
  teamName.value = '';
  teamDescription.value = '';
  teamPhone.value = '';
  teamEmail.value = '';
  teamImage.value = null;
  teamFile.value.value = ''
  currentTeamId.value = null
  errors.value.teamName = false;
  errors.value.teamDescription = false;
  errors.value.teamImage = false;
  errors.value.teamPhone = false;
  errors.value.teamEmail = false;
};
</script>

<template>
<div class="admin-panel__content">
  <h2>Управление страницей о нас</h2>
  <h3>Блоки</h3>
  <form class="admin-panel__content_form" v-if="!isEditingAbout_usBlock" @submit.prevent="createAbout_usBlock">
    <input
        type="text"
        class="basket__form_input admin-panel__content_input"
        v-model="about_usTitle"
        placeholder="Введите название"
        :class="{ error: errors.about_usTitle }"
    />
    <Editor @export-html="handleExportHtmlAbout_usBlock" :class="{ error: errors.about_usDescription }"/>
    <input
        type="file"
        ref="fileBanners"
        class="basket__form_input admin-panel__content_input"
        @change="handleFileChangeAbout_usBlock"
        accept="image/*"
        :class="{ error: errors.about_usImage }"
    />
    <button class="main_btn" type="submit">Создать блок</button>
  </form>
  <form class="admin-panel__content_form" v-if="isEditingAbout_usBlock" @submit.prevent="updateAbout_usBlock">
    <input
        type="text"
        class="basket__form_input admin-panel__content_input"
        v-model="about_usTitle"
        placeholder="Введите название"
        :class="{ error: errors.about_usTitle }"
    />
    <Editor :initialHtml="about_usDescription" @export-html="handleExportHtmlAbout_usBlock"
            :class="{ error: errors.about_usDescription }"/>
    <input
        type="file"
        ref="fileBanners"
        class="basket__form_input admin-panel__content_input"
        @change="handleFileChangeAbout_usBlock"
        accept="image/*"
    />
    <button class="main_btn" type="submit">Изменить блок</button>
    <button class="main_btn" type="submit" @click="resetAbout_usBlock">Отмена</button>
  </form>
  <table>
    <thead>
    <tr>
      <th>Название</th>
      <th>Описание</th>
      <th>Фото</th>
      <th>Изменить</th>
      <th>Удалить</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="section in about_usBlock.sections" :key="section.id">
      <td>{{ section.title }}</td>
      <td>{{ section.html }}</td>
      <td>
        <img :src="section.image" alt="Фото" width="50"/>
      </td>
      <td>
        <button @click="editAbout_usBlock(section)" class="admin-panel__content_btn">Изменить</button>
      </td>
      <td>
        <button @click="deleteAbout_usBlock(section.id)" class="admin-panel__content_btn">Удалить</button>
      </td>
    </tr>
    </tbody>
  </table>
  <h3>Патенты</h3>
  <form class="admin-panel__content_form" v-if="!isEditingPatent" @submit.prevent="createProductPatent">
    <input
        type="text"
        class="basket__form_input admin-panel__content_input"
        v-model="patentName"
        placeholder="Введите название"
        :class="{ error: errors.patentName }"
    />
    <input
        type="date"
        class="basket__form_input admin-panel__content_input"
        v-model="patentDate"
        placeholder="Введите дату"
        :class="{ error: errors.patentDate }"
    />
    <label class="admin-panel__content_label">Текстовый файл</label>
    <input
        type="file"
        ref="patentText"
        class="basket__form_input admin-panel__content_input"
        @change="handleFileChangePatent"
        accept="text/plain,.csv,.json"
        :class="{ error: errors.patentText }"
    />
    <button class="main_btn" type="submit">Создать</button>
  </form>
  <table>
    <thead>
    <tr>
      <th>ID</th>
      <th>Название</th>
      <th>Дата</th>
      <th>Удалить</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="patent in patents" :key="patent.id">
      <td>{{ patent.id }}</td>
      <td>{{ patent.title }}</td>
      <td>{{ formatDate(patent.date) }}</td>
      <td>
        <button @click="deletePatents(patent.id)" class="admin-panel__content_btn">Удалить</button>
      </td>
    </tr>
    </tbody>
  </table>
  <h3>Команда</h3>
  <form class="admin-panel__content_form" v-if="!isEditingTeam" @submit.prevent="createTeams">
    <input
        type="text"
        class="basket__form_input admin-panel__content_input"
        v-model="teamName"
        placeholder="Введите ФИО"
        :class="{ error: errors.teamName }"
    />
    <input
        type="text"
        class="basket__form_input admin-panel__content_input"
        v-model="teamDescription"
        placeholder="Введите описание"
        :class="{ error: errors.teamDescription }"
    />
    <input
        type="text"
        class="basket__form_input admin-panel__content_input"
        v-model="teamPhone"
        placeholder="Введите телефон"
        :class="{ error: errors.teamPhone }"
    />
    <input
        type="email"
        class="basket__form_input admin-panel__content_input"
        v-model="teamEmail"
        placeholder="Введите почту"
        :class="{ error: errors.teamEmail }"
    />
    <input
        type="file"
        ref="teamFile"
        class="basket__form_input admin-panel__content_input"
        @change="handleFileChangeTeam"
        accept="image/*"
        :class="{ error: errors.teamImage }"
    />
    <button class="main_btn" type="submit">Создать</button>
  </form>
  <form class="admin-panel__content_form" v-if="isEditingTeam" @submit.prevent="updateTeams">
    <input
        type="text"
        class="basket__form_input admin-panel__content_input"
        v-model="teamName"
        placeholder="Введите ФИО"
        :class="{ error: errors.teamName }"
    />
    <input
        type="text"
        class="basket__form_input admin-panel__content_input"
        v-model="teamDescription"
        placeholder="Введите описание"
        :class="{ error: errors.teamDescription }"
    />
    <input
        type="text"
        class="basket__form_input admin-panel__content_input"
        v-model="teamPhone"
        placeholder="Введите телефон"
        :class="{ error: errors.teamPhone }"
    />
    <input
        type="email"
        class="basket__form_input admin-panel__content_input"
        v-model="teamEmail"
        placeholder="Введите почту"
        :class="{ error: errors.teamEmail }"
    />
    <input
        type="file"
        ref="teamFile"
        class="basket__form_input admin-panel__content_input"
        @change="handleFileChangeTeam"
        accept="image/*"
    />
    <button class="main_btn" type="submit">Изменить</button>
    <button class="main_btn" @click="resetTeam">Отмена</button>
  </form>
  <table>
    <thead>
    <tr>
      <th>ID</th>
      <th>Название</th>
      <th>Описание</th>
      <th>Фото</th>
      <th>Телефон</th>
      <th>Почта</th>
      <th>Изменить</th>
      <th>Удалить</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="patent in teams" :key="patent.id">
      <td>{{ patent.id }}</td>
      <td>{{ patent.name }}</td>
      <td>{{ patent.description }}</td>
      <td>
        <img :src="patent.image" alt="Фото" width="50"/>
      </td>
      <td>{{ patent.phone }}</td>
      <td>{{ patent.email }}</td>
      <td>
        <button @click="editTeam(patent)" class="admin-panel__content_btn">Изменить</button>
      </td>
      <td>
        <button @click="deleteTeam(patent.id)" class="admin-panel__content_btn">Удалить</button>
      </td>
    </tr>
    </tbody>
  </table>
</div>
</template>

<style scoped lang="scss">

</style>